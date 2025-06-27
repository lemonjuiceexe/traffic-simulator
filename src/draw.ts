type CanvasVector = {
    x: number;
    y: number;
};
export function drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#2b931f";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // roads
    const roadWidth: number = 80;
    const roadGap: number = 40;
    ctx.fillStyle = "#555";
    ctx.fillRect(0, ctx.canvas.height / 2 - roadGap / 2 - roadWidth, ctx.canvas.width, roadWidth);
    ctx.fillRect(0, ctx.canvas.height / 2 + roadGap / 2, ctx.canvas.width, roadWidth);
    ctx.fillRect(ctx.canvas.width / 2 - roadGap / 2 - roadWidth, 0, roadWidth, ctx.canvas.height);
    ctx.fillRect(ctx.canvas.width / 2 + roadGap / 2, 0, roadWidth, ctx.canvas.height);
    ctx.fillRect(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth,
        roadGap + roadWidth * 2,
        roadGap + roadWidth * 2
    );
    // draw road markings
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.setLineDash([20, 20]);
    ctx.beginPath();
    ctx.moveTo(0, ctx.canvas.height / 2 - roadGap / 2 - roadWidth / 2);
    ctx.lineTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth / 2
    );
    ctx.moveTo(ctx.canvas.width, ctx.canvas.height / 2 - roadGap / 2 - roadWidth / 2);
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth / 2
    );
    ctx.moveTo(0, ctx.canvas.height / 2 + roadGap / 2 + roadWidth / 2);
    ctx.lineTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth / 2
    );
    ctx.moveTo(ctx.canvas.width, ctx.canvas.height / 2 + roadGap / 2 + roadWidth / 2);
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth / 2
    );
    ctx.moveTo(ctx.canvas.width / 2 - roadGap / 2 - roadWidth / 2, 0);
    ctx.lineTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth / 2,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.moveTo(ctx.canvas.width / 2 - roadGap / 2 - roadWidth / 2, ctx.canvas.height);
    ctx.lineTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth / 2,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.moveTo(ctx.canvas.width / 2 + roadGap / 2 + roadWidth / 2, 0);
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth / 2,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.moveTo(ctx.canvas.width / 2 + roadGap / 2 + roadWidth / 2, ctx.canvas.height);
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth / 2,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.stroke();
    // stop lines
    ctx.setLineDash([6, 3]);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.moveTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.moveTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 - roadGap / 2 - roadWidth
    );
    ctx.moveTo(
        ctx.canvas.width / 2 - roadGap / 2 - roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.lineTo(
        ctx.canvas.width / 2 + roadGap / 2 + roadWidth,
        ctx.canvas.height / 2 + roadGap / 2 + roadWidth
    );
    ctx.stroke();

    const trafficLightSize: CanvasVector = {
        x: 40,
        y: 60
    };
    const centerX: number = ctx.canvas.width / 2;
    const centerY: number = ctx.canvas.height / 2;
    const offset: number = 70;

    const trafficLightsPositions: CanvasVector[] = [
        { x: centerX - offset - trafficLightSize.x, y: centerY - trafficLightSize.y / 2 }, // left
        { x: centerX + offset, y: centerY - trafficLightSize.y / 2 }, // right
        { x: centerX - trafficLightSize.x / 2, y: centerY - offset - trafficLightSize.y }, // top
        { x: centerX - trafficLightSize.x / 2, y: centerY + offset } // bottom
    ];
    for (const pos of trafficLightsPositions) {
        // traffic light body
        ctx.fillStyle = "#333";
        ctx.fillRect(pos.x, pos.y, trafficLightSize.x, trafficLightSize.y);

        ["red", "yellow", "green"].forEach((color, index) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(
                pos.x + trafficLightSize.x / 2,
                pos.y + ((index + 1) * trafficLightSize.y) / 4,
                Math.min(trafficLightSize.x, trafficLightSize.y) / 8,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    }
}
