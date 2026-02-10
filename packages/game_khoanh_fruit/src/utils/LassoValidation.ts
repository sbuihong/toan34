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
        // 1. Lấy danh sách đối tượng trong vùng chọn
        const selectedObjects = objectManager.getObjectsInPolygon(polygon);
        
        console.log(`[LassoValidation] Đã khoanh trúng: ${selectedObjects.length} đối tượng.`);

        // 2. Kiểm tra điều kiện Đúng/Sai
        const wrongObject = objectManager.getWrongObject();

        let isSuccess = false;
        let failureReason = "";

        // Điều kiện thành công:
        // - Khoanh đúng 1 hình
        // - Hình đó phải là đáp án đúng
        // - Lấn qua hình sai không quá 1/5
        if (selectedObjects.length === 1) {
            const selectedObj = selectedObjects[0];
            
            if (objectManager.isCorrectAnswer(selectedObj)) {
                // Kiểm tra lấn qua hình sai
                if (wrongObject) {
                    const overlapWithWrong = objectManager.getOverlapPercentage(polygon, wrongObject);
                    
                    console.log(`[LassoValidation] Overlap với hình sai: ${(overlapWithWrong * 100).toFixed(1)}%`);
                    
                    if (overlapWithWrong > 0.2) { // 1/5 = 0.2
                        failureReason = `Vẽ lấn quá hình sai (${(overlapWithWrong * 100).toFixed(1)}% > 20%)`;
                    } else {
                        isSuccess = true;
                    }
                } else {
                    isSuccess = true;
                }
            } else {
                failureReason = "Khoanh sai đáp án!";
            }
        } else if (selectedObjects.length > 1) {
            failureReason = "Khoanh quá nhiều hình! Chỉ khoanh 1 hình thôi!";
        } else {
            failureReason = "Khoanh sai hoặc không trúng!";
        }

        return {
            success: isSuccess,
            failureReason: failureReason,
            selectedObjects: selectedObjects
        };
    }
}
