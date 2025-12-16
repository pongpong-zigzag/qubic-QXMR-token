interface Entity {
  x: number;
  y: number;
  size: number;
  color: string;
}

interface Qubic extends Entity {
  direction: { x: number; y: number };
  speed: number;
}

interface XMRBlock extends Entity {
  value: number;
}


class PacmanGame {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private qubic: Qubic;
  private blocks: XMRBlock[];
  private gameEnded: boolean = false;
  private endMessage: string = '';
  private score: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private keyState: { [key: string]: boolean } = {};
  private xmrImage: HTMLImageElement = new Image();
  private qubicImage: HTMLImageElement = new Image();
  private xmrImageLoaded: boolean = false;
  private qubicImageLoaded: boolean = false;
  private currentEpoch: number = 161;
  private blocksToNextEpoch: number = 10;
  private blocksCollected: number = 0;

  public imagesLoaded = false;
  private onReadyCallback: (() => void) | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    // Set public asset paths for Vite compatibility
    this.qubicImage.src = '/qubic-pacman.svg';
    this.xmrImage.src = '/xmr-block.png';

    // Initialize dimensions
    this.resize();

    // Initialize game objects
    this.qubic = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      size: 30,
      color: '#00F0FF',
      direction: { x: 0, y: 0 },
      speed: 200
    };

    this.blocks = [];
    
    // Initialize images
    this.xmrImage.onload = () => {
      this.xmrImageLoaded = true;
      this.checkImagesLoaded();
    };
    this.qubicImage.onload = () => {
      this.qubicImageLoaded = true;
      this.checkImagesLoaded();
    };
    
    this.xmrImage.src = '/xmr-block.png';
    this.qubicImage.src = '/qubic-pacman.svg';
    
    // Set up event listeners
    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Add touch event listeners
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Initial render
    this.render();
  }
  
  // Public method to run callbacks when the game is ready
  private checkImagesLoaded() {
    if (this.xmrImageLoaded && this.qubicImageLoaded) {
      this.imagesLoaded = true;
      this.initializeEpoch161();
      if (this.onReadyCallback) {
        this.onReadyCallback();
      }
    }
  }

  public onReady(callback: () => void) {
    if (this.imagesLoaded) {
      callback();
    } else {
      this.onReadyCallback = callback;
    }
  }
  

  
  private resize() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }
  
  private generateBlocks(count: number) {
    for (let i = 0; i < count; i++) {
      this.blocks.push({
        x: Math.random() * (this.canvas.width - 40) + 20,
        y: Math.random() * (this.canvas.height - 40) + 20,
        size: 20,
        color: '#FF4B4B',
        value: Math.floor(Math.random() * 100) + 50
      });
    }
  }
  
  private handleKeyDown(e: KeyboardEvent) {
    this.keyState[e.key] = true;
    
    switch (e.key) {
      case 'ArrowLeft':
        this.qubic.direction.x = -1;
        this.qubic.direction.y = 0;
        break;
      case 'ArrowRight':
        this.qubic.direction.x = 1;
        this.qubic.direction.y = 0;
        break;
      case 'ArrowUp':
        this.qubic.direction.x = 0;
        this.qubic.direction.y = -1;
        break;
      case 'ArrowDown':
        this.qubic.direction.x = 0;
        this.qubic.direction.y = 1;
        break;
    }
  }
  
  private handleKeyUp(e: KeyboardEvent) {
    this.keyState[e.key] = false;
    
    // Reset direction when no keys are pressed
    if (!this.keyState['ArrowLeft'] && !this.keyState['ArrowRight'] && 
        !this.keyState['ArrowUp'] && !this.keyState['ArrowDown']) {
      this.qubic.direction = { x: 0, y: 0 };
    }
  }
  
  private handleTouchStart(e: TouchEvent) {
    e.preventDefault();
    this.updateQubicDirectionFromTouch(e);
  }
  
  private handleTouchMove(e: TouchEvent) {
    e.preventDefault();
    this.updateQubicDirectionFromTouch(e);
  }
  
  private handleTouchEnd() {
    // Stop Qubic when touch ends
    this.qubic.direction = { x: 0, y: 0 };
  }
  
  private updateQubicDirectionFromTouch(e: TouchEvent) {
    if (!this.canvas || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    // Calculate direction vector from Qubic to touch point
    const dx = touchX - this.qubic.x;
    const dy = touchY - this.qubic.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      // Normalize the direction vector
      this.qubic.direction = {
        x: dx / distance,
        y: dy / distance
      };
    }
  }
  
  private update(deltaTime: number) {
    if (this.gameEnded) return;
    
    // Only update position if there's a direction
    if (this.qubic.direction.x !== 0 || this.qubic.direction.y !== 0) {
      this.qubic.x += this.qubic.direction.x * this.qubic.speed * deltaTime;
      this.qubic.y += this.qubic.direction.y * this.qubic.speed * deltaTime;
    }
    
    // Keep Qubic within bounds
    this.qubic.x = Math.max(this.qubic.size, Math.min(this.qubic.x, this.canvas.width - this.qubic.size));
    this.qubic.y = Math.max(this.qubic.size, Math.min(this.qubic.y, this.canvas.height - this.qubic.size));
    
    // Check collisions with XMR blocks
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const block = this.blocks[i];
      const dx = this.qubic.x - block.x;
      const dy = this.qubic.y - block.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.qubic.size + block.size / 2) {
        this.score += block.value;
        this.blocksCollected++;
        this.blocks.splice(i, 1);
        
        // Check if we've collected all blocks for current epoch
        if (this.blocksCollected >= this.blocksToNextEpoch) {
          if (this.currentEpoch >= 163) {
            // Game completed!
            this.gameEnded = true;
            this.endMessage = 'You Win!';
            this.isRunning = false;
            return;
          }
          this.advanceEpoch();
        }
      }
    }
    
    // End game if all blocks are collected (shouldn't normally happen due to above check)
    if (this.blocks.length === 0 && !this.gameEnded) {
      this.gameEnded = true;
      this.endMessage = `Epoch ${this.currentEpoch} Complete!`;
      this.isRunning = false;
    }
  }
  
  public render() {
    // Clear canvas with dark background
    this.ctx.fillStyle = '#0A1B2A';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid lines
    this.ctx.strokeStyle = '#1B3247';
    this.ctx.lineWidth = 1;
    
    const gridSize = 30;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
    
    // Draw XMR blocks if image is loaded
    if (this.xmrImageLoaded) {
      for (const block of this.blocks) {
        this.ctx.save();
        this.ctx.translate(block.x, block.y);
        // Reduce block image size by 33%
        const blockDrawSize = block.size * 0.67;
        this.ctx.drawImage(
          this.xmrImage,
          -blockDrawSize,
          -blockDrawSize,
          blockDrawSize * 2,
          blockDrawSize * 2
        );
        this.ctx.restore();
      }
    }
    
    // Draw Qubic if image is loaded
    if (this.qubicImageLoaded) {
      this.ctx.save();
      this.ctx.translate(this.qubic.x, this.qubic.y);

      // Flip vertically (SVG asset is upside down by default)
      this.ctx.scale(1, -1);

      // Rotate based on direction
      if (this.qubic.direction.x !== 0 || this.qubic.direction.y !== 0) {
        const angle = Math.atan2(this.qubic.direction.y, this.qubic.direction.x);
        this.ctx.rotate(angle);
      }

      this.ctx.drawImage(
        this.qubicImage,
        -this.qubic.size,
        -this.qubic.size,
        this.qubic.size * 2,
        this.qubic.size * 2
      );
      this.ctx.restore();
    }
    
    // Draw score
    this.ctx.fillStyle = '#D0D8E1';
    this.ctx.font = '16px Inter';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`Score: ${this.score}`, 10, 10);

    // Draw game end message if game ended
    if (this.gameEnded) {
      this.ctx.save();
      this.ctx.font = 'bold 48px Inter';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(this.endMessage, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.restore();
    }
    
    // Draw Epoch and progress
    this.ctx.fillStyle = '#00F0FF';
    this.ctx.font = '14px Inter';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`Epoch: ${this.currentEpoch}`, this.canvas.width - 10, 10);
    this.ctx.fillText(`Progress: ${this.blocksCollected}/${this.blocksToNextEpoch}`, this.canvas.width - 10, 30);
  }

  private gameLoop(timestamp: number) {
    if (!this.isRunning) return;

    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    this.update(deltaTime);
    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }
  
  private getBlocksForEpoch(epoch: number): number {
    // Custom block counts for specific epochs
    const epochBlocks: {[key: number]: number} = {
      161: 10,
      162: 15,
      163: 20
    };
    return epochBlocks[epoch] || 10; // Default to 10 if epoch not specified
  }

  private advanceEpoch() {
    this.currentEpoch = Math.min(163, this.currentEpoch + 1); // Cap at epoch 163
    this.blocksCollected = 0;
    this.blocksToNextEpoch = this.getBlocksForEpoch(this.currentEpoch);
    
    // Slight speed increase per epoch (5%)
    this.qubic.speed = 200 * Math.pow(1.05, this.currentEpoch - 161);
    
    // Generate exactly the number of blocks needed for this epoch
    this.blocks = [];
    this.generateBlocks(this.blocksToNextEpoch);
    
    this.qubic.x = this.canvas.width / 2;
    this.qubic.y = this.canvas.height / 2;
    this.qubic.direction = { x: 0, y: 0 };
    this.endMessage = this.currentEpoch <= 163 ? `Epoch ${this.currentEpoch} Started!` : 'You Win!';
    this.gameEnded = true;
    this.isRunning = false;
    
    // Auto-continue after a short delay
    setTimeout(() => {
      this.gameEnded = false;
      this.start();
    }, 1500);
  }

  public start() {
    if (this.gameEnded) {
      this.gameEnded = false;
      this.blocks = [];
      this.generateBlocks(this.blocksToNextEpoch);
      this.qubic.x = this.canvas.width / 2;
      this.qubic.y = this.canvas.height / 2;
      this.qubic.direction = { x: 0, y: 0 };
      this.score = 0;
      this.blocksCollected = 0;
    }
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTimestamp = 0;
      this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }
  }
  
  public pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  public initializeEpoch161() {
    if (!this.imagesLoaded) {
      console.warn('Images not loaded yet. Cannot initialize Epoch 161.');
      return;
    }
    
    this.gameEnded = false;
    this.score = 0;
    this.currentEpoch = 161;
    this.blocksToNextEpoch = this.getBlocksForEpoch(161);
    this.blocksCollected = 0;
    this.qubic.speed = 200;
    this.qubic.x = this.canvas.width / 2;
    this.qubic.y = this.canvas.height / 2;
    this.qubic.direction = { x: 0, y: 0 };
    
    this.blocks = [];
    this.generateBlocks(this.blocksToNextEpoch);
    
    // Force a re-render
    this.render();
  }

  public restart() {
    this.initializeEpoch161();
    
    if (this.isRunning) {
      this.pause();
      this.start();
    } else {
      // If game was paused, make sure to clear the end message
      this.render();
    }
  }
  
  public destroy() {
    this.pause();
    window.removeEventListener('resize', this.resize.bind(this));
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    this.container.removeChild(this.canvas);
  }
}

export default PacmanGame;
