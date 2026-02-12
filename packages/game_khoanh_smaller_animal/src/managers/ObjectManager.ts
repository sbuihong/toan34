
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

        if (!configData) {
            console.warn("ObjectManager: Config data missing.");
            return;
        }

        const { width, height } = this.scene.scale;

        // 1. Spawn Background/Main Image (Visual Only)
        // Nếu layout mới có "background" thì spawn nó nhưng KHÔNG add vào list objects (để tránh lasso check)
        if (configData.background) {
             const bgDef = configData.background;
             const bgKey = bgDef.textureKey;
             // Vị trí mặc định giữa màn hình hoặc config (ưu tiên x_pct/y_pct, fallback baseX_pct/baseY_pct)
             const bgX = width * (bgDef.x_pct ?? bgDef.baseX_pct ?? 0.5);
             const bgY = height * (bgDef.y_pct ?? bgDef.baseY_pct ?? 0.5); 
             
             // Check if background image already exists to update or create new
             // Note: In strict 'spawn', existing non-managed objects might be tricky. 
             // We'll assume ObjectManager manages GAMEPLAY objects. 
             // Decor/BG can be managed here or Scene. 
             // Let's create it as a non-interactive back visual.
             const bg = this.scene.add.image(bgX, bgY, bgKey);
             if (bgDef.scale) bg.setScale(bgDef.scale);
             bg.setDepth(1); // Ensure it is above the board (depth 0)
        }

        // 2. Spawn Targets (Invisible Hit Zones)
        const targets = configData.targets;

        if (Array.isArray(targets)) {
            targets.forEach((def: any, index: number) => {
                // Tính toán toạ độ từ phần trăm màn hình
                const x = def.x_pct * width;
                const y = def.y_pct * height;
                
                // Tạo HitZone dùng transparent texture (1x1 pixel)
                const hitZone = this.scene.add.image(x, y, 'transparent');
                
                // Scale theo radius (transparent texture là 1x1px -> scale = 2*radius)
                if (def.radius) {
                    const scale = def.radius * 2;
                    hitZone.setScale(scale);
                } else {
                    // Fallback nếu không có radius
                    hitZone.setScale(100);
                }
                
                // Gần như ẩn, nhưng vẫn tương tác được
                hitZone.setAlpha(0.01);

                // Lưu metadata
                hitZone.setData('role', def.role || 'wrong'); 
                hitZone.setData('id', def.id !== undefined ? def.id : index);

                this.objects.push(hitZone);

                // 3. Render Circle Outline if 'activity' is true
                if (def.activity) {
                     const graphics = this.scene.add.graphics();
                     graphics.lineStyle(5, 0xff0000); // Red outline, 5px
                     
                     // Get radius from config
                     const radius = def.radius || 50;

                     graphics.strokeCircle(x, y, radius);
                     graphics.setDepth(10); // Above background
                     
                     // Attach to object for cleanup
                     hitZone.setData('visualOutline', graphics);
                }
            });
        }

        console.log(`ObjectManager: Đã tạo ${this.objects.length} đối tượng (HitZones).`);
    }
    
    /**
     * Kiểm tra xem những đối tượng nào nằm trong vùng chọn.
     * @param polygon Vùng chọn (Phaser.Geom.Polygon)
     * @returns Danh sách các đối tượng nằm bên trong (tâm nằm trong polygon)
     */
    public getObjectsInPolygon(polygon: Phaser.Geom.Polygon): Phaser.GameObjects.Image[] {
        const selectedObjects: Phaser.GameObjects.Image[] = [];

        this.objects.forEach(obj => {
            if (Phaser.Geom.Polygon.Contains(polygon, obj.x, obj.y)) {
                selectedObjects.push(obj);
            }
        });

        return selectedObjects;
    }

    /**
     * Tính phần trăm overlap giữa polygon và bounding box của object
     * @param polygon Vùng vẽ
     * @param object Object cần kiểm tra
     * @returns Phần trăm overlap (0-1)
     */
    public getOverlapPercentage(polygon: Phaser.Geom.Polygon, object: Phaser.GameObjects.Image): number {
        // Lấy bounding box của object
        const objBounds = new Phaser.Geom.Rectangle(
            object.x - object.displayWidth / 2,
            object.y - object.displayHeight / 2,
            object.displayWidth,
            object.displayHeight
        );
        
        const objArea = objBounds.width * objBounds.height;
        if (objArea === 0) return 0;

        // Kiểm tra overlap bằng cách lấy 4 góc + tâm + các điểm trên cạnh
        const testPoints: Phaser.Math.Vector2[] = [
            // 4 góc
            new Phaser.Math.Vector2(objBounds.left, objBounds.top),
            new Phaser.Math.Vector2(objBounds.right, objBounds.top),
            new Phaser.Math.Vector2(objBounds.left, objBounds.bottom),
            new Phaser.Math.Vector2(objBounds.right, objBounds.bottom),
            // Tâm
            new Phaser.Math.Vector2(object.x, object.y),
            // Các điểm giữa cạnh
            new Phaser.Math.Vector2((objBounds.left + objBounds.right) / 2, objBounds.top),
            new Phaser.Math.Vector2((objBounds.left + objBounds.right) / 2, objBounds.bottom),
            new Phaser.Math.Vector2(objBounds.left, (objBounds.top + objBounds.bottom) / 2),
            new Phaser.Math.Vector2(objBounds.right, (objBounds.top + objBounds.bottom) / 2),
        ];

        // Đếm bao nhiêu điểm nằm trong polygon
        let pointsInside = 0;
        testPoints.forEach(point => {
            if (Phaser.Geom.Polygon.Contains(polygon, point.x, point.y)) {
                pointsInside++;
            }
        });

        // Tính phần trăm dựa trên số điểm nằm trong
        const overlapPercentage = pointsInside / testPoints.length;
        return overlapPercentage;
    }

    public isCorrectAnswer(object: Phaser.GameObjects.Image): boolean {
        return object.getData('role') === 'correct';
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
        this.objects.forEach(obj => {
            const visual = obj.getData('visualOutline');
            if (visual) {
                visual.destroy();
            }
            obj.destroy();
        });
        this.objects = [];
    }
}
