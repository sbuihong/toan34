
import Phaser from 'phaser';

/**
 * Quản lý các đối tượng trong game (ObjectManager).
 * Nhiệm vụ:
 * 1. Tạo (Spawn) các đối tượng từ file config.
 * 2. Cung cấp danh sách đối tượng.
 * 3. Kiểm tra đối tượng nào nằm trong vùng chọn (Polygon).
 */
export class ObjectManager {
    private scene: Phaser.Scene;
    private objects: Phaser.GameObjects.Image[] = [];

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.objects = [];
    }

    public getAllObjects() {
        return this.objects;
    }

    /**
     * Tải và tạo các đối tượng từ dữ liệu Level Config.
     * @param configData Dữ liệu JSON config của level
     */
    public spawnObjectsFromConfig(configData: any) {
        // Xóa cũ nếu có
        this.clearObjects();

        if (!configData || !configData.images) {
            console.warn("ObjectManager: Không tìm thấy config objects.");
            return;
        }

        configData.images.forEach((def: any) => {
             // Xử lý texture key. Fallback nếu thiếu
             let key = def.textureKey;

             // Tính toán toạ độ (giả sử có helper convert % sang px, ở đây dùng tạm logic đơn giản hoặc truyền helper vào sau)
             // Lưu ý: Trong code gốc dùng GameUtils.pctX, nên cần đảm bảo tính toán đúng coordinate.
             // Ở đây để đơn giản ta giả định caller (Scene) đã tính hoặc truyền width/height vào, 
             // nhưng để clean thì ta sẽ truyền scene vào constructor và dùng scene scale.
             
             const { width, height } = this.scene.scale;
             const x = def.baseX_pct * width; // Chuyển đổi sơ bộ, có thể cần thay bằng GameUtils
             const y = def.baseY_pct * height;
             
             const img = this.scene.add.image(x, y, key);
             
             // Scale
             if (def.baseScale) {
                 img.setScale(def.baseScale);
             }

             // Lưu metadata nếu cần (ví dụ: đây là vật thể đếm được)
             img.setData('isTarget', true); // Giả định tất cả đều là target
             
             this.objects.push(img);
        });

        console.log(`ObjectManager: Đã tạo ${this.objects.length} đối tượng.`);
    }
    
    /**
     * Kiểm tra xem những đối tượng nào nằm trong vùng chọn.
     * @param polygon Vùng chọn (Phaser.Geom.Polygon)
     * @returns Danh sách các đối tượng nằm bên trong
     */
    public getObjectsInPolygon(polygon: Phaser.Geom.Polygon): Phaser.GameObjects.Image[] {
        const selectedObjects: Phaser.GameObjects.Image[] = [];

        this.objects.forEach(obj => {
            // Kiểm tra tâm của object
            // Có thể mở rộng kiểm tra bounding box nếu cần chính xác hơn
            if (Phaser.Geom.Polygon.Contains(polygon, obj.x, obj.y)) {
                selectedObjects.push(obj);
            }
        });

        return selectedObjects;
    }

    /**
     * Hiệu ứng khi chọn đúng/sai (Visual Feedback)
     */
    public highlightObjects(objects: Phaser.GameObjects.Image[], isCorrect: boolean) {
        const color = isCorrect ? 0x00ff00 : 0xff0000;
        objects.forEach(obj => {
            this.scene.tweens.add({
                targets: obj,
                scale: obj.scale * 1.2,
                duration: 200,
                yoyo: true,
                onStart: () => obj.setTint(color),
                onComplete: () => obj.clearTint()
            });
        });
    }

    public clearObjects() {
        this.objects.forEach(obj => obj.destroy());
        this.objects = [];
    }
}
