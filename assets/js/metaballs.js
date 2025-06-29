class MetaBalls {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                ballCount: 8,
                ballSize: 60,
                speed: 0.002,
                color: '4300FF',
                mouseSize: 80,
                threshold: 0.6,
            };
        
        this.canvas = null;
        this.ctx = null;
        this.balls = [];
        this.mouse = { x: 0, y: 0, active: false };
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        `;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize balls
        this.createBalls();
        
        // Setup resize handler with delay to ensure container is sized
        setTimeout(() => {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            // Start animation only after resize
            this.animate();
        }, 100);
    }
    
    createBalls() {
        this.balls = [];
        for (let i = 0; i < this.options.ballCount; i++) {
        this.balls.push({
            x: Math.random() * (window.innerWidth || 800),
            y: Math.random() * (window.innerHeight || 600),
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: this.options.ballSize + Math.random() * 20,
            phase: Math.random() * Math.PI * 2
        });
        }
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        
        // Fallback to window dimensions if container has no size
        if (width <= 0 || height <= 0) {
            width = window.innerWidth || 800;
            height = window.innerHeight || 600;
        }
        
        // Ensure minimum dimensions
        width = Math.max(width, 100);
        height = Math.max(height, 100);
        
        this.canvas.width = width;
        this.canvas.height = height;
    }

    updateBalls(time) {
        this.balls.forEach((ball, index) => {
        // Smooth orbital motion
        const angle = time * this.options.speed + ball.phase;
        const radius = 100 + Math.sin(time * 0.001 + index) * 50;
        
        ball.x = this.canvas.width / 2 + Math.cos(angle) * radius;
        ball.y = this.canvas.height / 2 + Math.sin(angle * 0.7) * radius * 0.6;
        
        // Keep balls in bounds
        if (ball.x < 0 || ball.x > this.canvas.width) ball.vx *= -1;
        if (ball.y < 0 || ball.y > this.canvas.height) ball.vy *= -1;
        });
    }
    
    drawMetaBalls() {
        // Validate canvas dimensions before creating ImageData
        if (this.canvas.width <= 0 || this.canvas.height <= 0) {
            return; // Skip drawing if canvas has invalid dimensions
        }
        
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Parse color
        const color = this.hexToRgb(this.options.color);
        
        for (let x = 0; x < this.canvas.width; x += 2) {
        for (let y = 0; y < this.canvas.height; y += 2) {
            let sum = 0;
            
            // Calculate influence from all balls
            this.balls.forEach(ball => {
            const dx = x - ball.x;
            const dy = y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
                sum += ball.size / distance;
            }
            });
            
            
            // Apply threshold and draw
            if (sum > this.options.threshold) {
            const alpha = Math.min(1, (sum - this.options.threshold) * 2);
            const index = (y * this.canvas.width + x) * 4;
            
            if (index < data.length) {
                data[index] = color.r;     // Red
                data[index + 1] = color.g; // Green
                data[index + 2] = color.b; // Blue
                data[index + 3] = alpha * 255; // Alpha
                
                // Fill adjacent pixels for smoother appearance
                if (x + 1 < this.canvas.width) {
                const nextIndex = (y * this.canvas.width + (x + 1)) * 4;
                data[nextIndex] = color.r;
                data[nextIndex + 1] = color.g;
                data[nextIndex + 2] = color.b;
                data[nextIndex + 3] = alpha * 255;
                }
                if (y + 1 < this.canvas.height) {
                const belowIndex = ((y + 1) * this.canvas.width + x) * 4;
                data[belowIndex] = color.r;
                data[belowIndex + 1] = color.g;
                data[belowIndex + 2] = color.b;
                data[belowIndex + 3] = alpha * 255;
                }
            }
            }
        }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
        } : { r: 102, g: 126, b: 234 };
    }
    
    animate() {
        // Only animate if canvas has valid dimensions
        if (this.canvas.width <= 0 || this.canvas.height <= 0) {
            // Retry after a short delay
            setTimeout(() => this.animate(), 100);
            return;
        }
        
        const time = performance.now();
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw
        this.updateBalls(time);
        this.drawMetaBalls();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    

    }

    // Initialize metaballs with proper configuration
    document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('metaballs');
    if (container) {
        new MetaBalls(container, {
        ballCount: 6,
        ballSize: 40,
        speed: 0.001,
        color: '#667eea',
        mouseSize: 120,
        threshold: 0.6
        });
    }
    });