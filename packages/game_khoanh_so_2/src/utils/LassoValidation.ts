import Phaser from 'phaser';
import { ObjectManager } from '../managers/ObjectManager';

export interface LassoResult {
    success: boolean;
    failureReason?: string;
    selectedObjects: Phaser.GameObjects.GameObject[];
}

export class LassoValidation {
    /**
     * Xác thực logic khoanh vùng
     * @param polygon Hình đa giác do người chơi vẽ
     * @param objectManager Quản lý đối tượng trong game
     * @returns Kết quả xác thực (thành công/thất bại, lý do, danh sách object đã chọn)
     */
    static validateSelection(polygon: Phaser.Geom.Polygon, objectManager: ObjectManager): LassoResult {
        // 1. Lấy danh sách đối tượng có tâm nằm trong vùng chọn (Primary Candidates)
        const objectsInside = objectManager.getObjectsInPolygon(polygon);
        
        console.log(`[LassoValidation] Objects inside: ${objectsInside.length}`);

        let isSuccess = false;
        let failureReason = "";
        let primaryTarget: Phaser.GameObjects.GameObject | null = null;

        // RULE 1: Chỉ được khoanh đúng 1 đối tượng chính
        if (objectsInside.length === 1) {
            const target = objectsInside[0];
            primaryTarget = target;

            // RULE 2: Đối tượng đó phải là đáp án đúng
            if (objectManager.isCorrectAnswer(target)) {
                
                // RULE 3: Kiểm tra chồng lấn với TẤT CẢ các đối tượng khác (bất kể đúng hay sai)
                // Điều kiện: Không được đè lên > 20% diện tích của bất kỳ hình nào khác
                const allObjects = objectManager.getAllObjects();
                let isOverlapViolation = false;

                for (const obj of allObjects) {
                    if (obj === target) continue; // Bỏ qua chính nó

                    const overlapPct = objectManager.getOverlapPercentage(polygon, obj);
                    if (overlapPct > 0.2) {
                        isOverlapViolation = true;
                        failureReason = `Đè lên hình khác quá nhiều (${(overlapPct * 100).toFixed(0)}%)`;
                        console.log(`[LassoValidation] Violation: Overlap with obj ${obj.getData('id')} is ${(overlapPct * 100).toFixed(1)}%`);
                        break;
                    }
                }

                if (!isOverlapViolation) {
                    isSuccess = true;
                }
            } else {
                failureReason = "Khoanh sai đáp án!";
            }
        } else if (objectsInside.length > 1) {
            failureReason = "Khoanh quá nhiều hình! Chỉ khoanh 1 hình thôi!";
        } else {
            // Trường hợp 0 object inside -> Kiểm tra xem có overlap > 50% với object nào không (fallback)
            // Tuy nhiên user yêu cầu "không được khoanh lệch ra ngoài quá nhiều vùng trung tâm",
            // nên việc bắt buộc tâm phải nằm trong (objectsInside.length > 0) là hợp lý.
            failureReason = "Chưa khoanh trúng hoặc khoanh quá lệch!";
        }

        return {
            success: isSuccess,
            failureReason: failureReason,
            selectedObjects: primaryTarget ? [primaryTarget] : []
        };
    }
}
