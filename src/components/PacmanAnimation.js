import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
// Image paths - using absolute paths from public directory
const qubicPacmanImg = '/qubic-pacman.png';
const xmrBlockImg = '/xmr-block.png';
function PacmanAnimation({ width: propWidth = 400, height: propHeight = 200, blockCount = 10, className = '' }) {
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({
        width: propWidth,
        height: propHeight
    });
    // Simple Pacman state
    const [pacman, setPacman] = useState(() => {
        // Initialize with default values that will be updated after first render
        return {
            x: 0, // Will be set in effect
            y: 0, // Will be set in effect
            size: 24,
            speedX: 0, // Start with 0 speed
            speedY: 0,
            rotation: 0
        };
    });
    // Set initial position after dimensions are known
    useEffect(() => {
        if (dimensions.width > 0 && dimensions.height > 0) {
            setPacman(prev => ({
                ...prev,
                x: dimensions.width / 2,
                y: dimensions.height / 2,
                speedX: 2,
                speedY: 1.5,
                rotation: -45 // Rotate 45 degrees to the left initially
            }));
        }
    }, [dimensions.width, dimensions.height]);
    // Simple blocks state
    const [blocks, setBlocks] = useState([]);
    // Animation frame reference
    const animationRef = useRef();
    // Update dimensions
    useEffect(() => {
        if (!containerRef.current)
            return;
        const updateSize = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (!parent)
                    return;
                // Use parent's dimensions instead of container's own dimensions
                const parentRect = parent.getBoundingClientRect();
                const newWidth = Math.max(parentRect.width, 100);
                const newHeight = Math.max(parentRect.height, propHeight);
                console.log('[PacmanAnimation] Updating container dimensions:', {
                    newWidth,
                    newHeight,
                    parentWidth: parentRect.width,
                    parentHeight: parentRect.height,
                    propWidth,
                    propHeight
                });
                // Update container's style to match parent
                containerRef.current.style.width = `${newWidth}px`;
                containerRef.current.style.height = `${newHeight}px`;
                // Update state for block generation
                setDimensions({
                    width: newWidth,
                    height: newHeight
                });
            }
        };
        // Initial update
        updateSize();
        // Create a ResizeObserver for the parent element
        const resizeObserver = new ResizeObserver(updateSize);
        const parent = containerRef.current.parentElement;
        if (parent) {
            resizeObserver.observe(parent);
        }
        // Also listen to window resize as fallback
        window.addEventListener('resize', updateSize);
        // Cleanup
        return () => {
            if (parent) {
                resizeObserver.unobserve(parent);
            }
            window.removeEventListener('resize', updateSize);
        };
    }, [propWidth, propHeight]);
    const { width, height } = dimensions;
    // Generate blocks helper
    const MAX_VISIBLE_BLOCKS = 500;
    function generateBlocks() {
        const newBlocks = [];
        const blockSize = 12;
        const padding = 20;
        const count = Math.min(blockCount, MAX_VISIBLE_BLOCKS);
        // Use the actual container dimensions if available
        const containerWidth = containerRef.current?.clientWidth || width;
        const containerHeight = containerRef.current?.clientHeight || height;
        const effectiveWidth = Math.max(containerWidth, width);
        const effectiveHeight = Math.max(containerHeight, height);
        console.log('[PacmanAnimation] Generating blocks with dimensions:', {
            width: effectiveWidth,
            height: effectiveHeight,
            containerWidth,
            containerHeight,
            propWidth,
            propHeight
        });
        for (let i = 0; i < count; i++) {
            let x, y, tries = 0;
            let found = false;
            while (tries < 20) {
                x = padding + Math.random() * (effectiveWidth - 2 * padding);
                y = padding + Math.random() * (effectiveHeight - 2 * padding);
                if (!newBlocks.some(b => Math.hypot(b.x - x, b.y - y) < blockSize * 1.5)) {
                    found = true;
                    break;
                }
                tries++;
            }
            if (found) {
                newBlocks.push({
                    id: `block-${i}-${Date.now()}`,
                    x,
                    y,
                    size: blockSize,
                    visible: true
                });
            }
        }
        return newBlocks;
    }
    // Generate initial blocks
    useEffect(() => {
        setBlocks(generateBlocks());
    }, [blockCount, width, height]);
    // Find the nearest block to target
    const findNearestBlock = (pacmanX, pacmanY) => {
        let nearestBlock = null;
        let minDistance = Infinity;
        blocks.forEach(block => {
            if (!block.visible)
                return;
            const dx = block.x - pacmanX;
            const dy = block.y - pacmanY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestBlock = { x: block.x, y: block.y };
            }
        });
        return nearestBlock;
    };
    // Generate a new block at a random position
    const generateNewBlock = () => {
        const padding = 20;
        return {
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: padding + Math.random() * (width - 2 * padding),
            y: padding + Math.random() * (height - 2 * padding),
            size: 12,
            visible: true
        };
    };
    // Check and handle block collisions
    const checkBlockCollisions = (pacmanX, pacmanY) => {
        setBlocks(prevBlocks => {
            let updatedBlocks = prevBlocks.map(block => {
                const dx = block.x - pacmanX;
                const dy = block.y - pacmanY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (!block.eaten && distance < 20) {
                    return { ...block, eaten: true };
                }
                return block;
            });
            // Remove blocks after animation duration
            setTimeout(() => {
                setBlocks(currentBlocks => {
                    let filtered = currentBlocks.filter(b => !b.eaten);
                    // Enforce hard cap
                    if (filtered.length > MAX_VISIBLE_BLOCKS) {
                        filtered = filtered.slice(-MAX_VISIBLE_BLOCKS);
                    }
                    // Replenish if needed
                    while (filtered.length < MAX_VISIBLE_BLOCKS) {
                        filtered.push(generateNewBlock());
                    }
                    return filtered;
                });
            }, 250); // match CSS duration
            // Enforce hard cap immediately (for non-eaten blocks)
            let visibleNotEaten = updatedBlocks.filter(b => !b.eaten);
            if (visibleNotEaten.length > MAX_VISIBLE_BLOCKS) {
                // Remove oldest blocks if over cap
                const toKeep = updatedBlocks.filter(b => !b.eaten).slice(-MAX_VISIBLE_BLOCKS);
                updatedBlocks = updatedBlocks.filter(b => b.eaten).concat(toKeep);
            }
            return updatedBlocks;
        });
    };
    // Add fade/scale CSS animation
    if (typeof window !== 'undefined') {
        const styleId = 'pacman-block-fade-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
        .block-eaten {
          opacity: 0 !important;
          transform: translate(-50%, -50%) scale(0.3) !important;
          transition: opacity 0.25s, transform 0.25s;
        }
      `;
            document.head.appendChild(style);
        }
    }
    // Movement function with improved block hunting and wandering
    const movePacman = () => {
        setPacman(prev => {
            // Find nearest block and calculate target
            const nearestBlock = findNearestBlock(prev.x, prev.y);
            let newSpeedX = prev.speedX;
            let newSpeedY = prev.speedY;
            // Add a small random movement to prevent getting stuck
            const randomNudge = 0.1;
            newSpeedX += (Math.random() * 2 - 1) * randomNudge;
            newSpeedY += (Math.random() * 2 - 1) * randomNudge;
            // If we have a target block, move towards it
            if (nearestBlock) {
                const dx = nearestBlock.x - prev.x;
                const dy = nearestBlock.y - prev.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                // Normalize direction and set speed
                if (distance > 10) { // Don't get too close to avoid jitter
                    const speed = 4.0; // Increased from 2.5
                    const targetSpeedX = (dx / distance) * speed;
                    const targetSpeedY = (dy / distance) * speed;
                    // Smoothly interpolate towards target speed
                    const smoothFactor = 0.2; // Increased from 0.1 for more responsive movement
                    newSpeedX = prev.speedX + (targetSpeedX - prev.speedX) * smoothFactor;
                    newSpeedY = prev.speedY + (targetSpeedY - prev.speedY) * smoothFactor;
                }
            }
            // Random direction change if no target or sometimes even with target
            if (!nearestBlock || Math.random() < 0.01) {
                const angle = Math.atan2(newSpeedY, newSpeedX) + (Math.random() - 0.5) * 0.5;
                const speed = Math.min(Math.sqrt(newSpeedX * newSpeedX + newSpeedY * newSpeedY) * 1.5, 4.5); // Increased max speed
                newSpeedX = Math.cos(angle) * speed;
                newSpeedY = Math.sin(angle) * speed;
            }
            // Calculate new position
            let newX = prev.x + newSpeedX;
            let newY = prev.y + newSpeedY;
            // Bounce off walls with some randomness and redirection
            const bounceFactor = 0.9;
            if (newX < 20) {
                newX = 20;
                newSpeedX = Math.abs(newSpeedX) * bounceFactor;
                // Add some vertical movement when hitting horizontal walls
                newSpeedY += (Math.random() - 0.5) * 2;
            }
            else if (newX > width - 20) {
                newX = width - 20;
                newSpeedX = -Math.abs(newSpeedX) * bounceFactor;
                // Add some vertical movement when hitting horizontal walls
                newSpeedY += (Math.random() - 0.5) * 2;
            }
            if (newY < 20) {
                newY = 20;
                newSpeedY = Math.abs(newSpeedY) * bounceFactor;
                // Add some horizontal movement when hitting vertical walls
                newSpeedX += (Math.random() - 0.5) * 2;
                newSpeedY = -Math.abs(newSpeedY) * bounceFactor;
            }
            // Calculate the position of Pacman's mouth (offset to the right side of the image)
            const mouthOffset = prev.size * 0.4; // Adjust this value to fine-tune the mouth position
            const rotationRad = (prev.rotation - 90) * (Math.PI / 180); // Convert to radians and adjust for image rotation
            const mouthX = newX + Math.cos(rotationRad) * mouthOffset;
            const mouthY = newY + Math.sin(rotationRad) * mouthOffset;
            // Check for block collisions using the mouth position
            checkBlockCollisions(mouthX, mouthY);
            // Calculate rotation based on movement direction
            const rotation = Math.atan2(newSpeedY, newSpeedX) * (180 / Math.PI) + 90;
            return {
                ...prev,
                x: newX,
                y: newY,
                speedX: newSpeedX,
                speedY: newSpeedY,
                rotation
            };
        });
    };
    // Regenerate blocks if too few are visible
    const checkAndRegenerateBlocks = useRef(() => {
        setBlocks(prevBlocks => {
            const visibleBlocks = prevBlocks.filter(b => b.visible && !b.eaten);
            // If we have less than 50% of target blocks, regenerate a small batch
            const targetThreshold = blockCount * 0.5;
            if (visibleBlocks.length < targetThreshold) {
                const blocksToAdd = Math.min(5, blockCount - visibleBlocks.length); // Add up to 5 new blocks
                console.log('[PacmanAnimation] Adding new blocks:', blocksToAdd, 'Current visible:', visibleBlocks.length);
                // Filter out old invisible blocks if we have too many total
                let filteredBlocks = [...prevBlocks];
                const invisibleBlocks = filteredBlocks.filter(b => !b.visible || b.eaten);
                if (invisibleBlocks.length > blockCount) {
                    const toRemove = new Set(invisibleBlocks.slice(0, invisibleBlocks.length - blockCount));
                    filteredBlocks = filteredBlocks.filter(b => (b.visible && !b.eaten) || !toRemove.has(b));
                }
                // Add new blocks individually
                const newBlocks = [...filteredBlocks];
                for (let i = 0; i < blocksToAdd; i++) {
                    newBlocks.push(generateNewBlock());
                }
                return newBlocks;
            }
            return prevBlocks;
        });
    });
    useEffect(() => {
        let animationRunning = true;
        let lastBlockCheck = 0;
        const animate = (time) => {
            if (!animationRunning || !containerRef.current)
                return;
            if (containerRef.current.offsetParent !== null) {
                movePacman();
                // Increase interval to slow down regeneration
                if (time - lastBlockCheck > 5000) {
                    checkAndRegenerateBlocks.current();
                    lastBlockCheck = time;
                }
            }
            if (animationRunning) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            animationRunning = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height, blocks.length]);
    return (_jsxs("div", { ref: containerRef, className: `relative overflow-hidden w-full h-full ${className}`, style: {
            minWidth: propWidth,
            minHeight: propHeight,
            width: '100%',
            height: '100%'
        }, children: [blocks.filter(block => !block.eaten && block.visible !== false).slice(-MAX_VISIBLE_BLOCKS).map((block) => (_jsx("img", { src: xmrBlockImg, alt: "XMR Block", className: `absolute transition-opacity duration-300${block.eaten ? ' block-eaten' : ''}`, style: {
                    left: `${block.x}px`,
                    top: `${block.y}px`,
                    width: `${block.size}px`,
                    height: `${block.size}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 1
                } }, block.id))), _jsx("img", { src: qubicPacmanImg, alt: "Pacman", className: "absolute", style: {
                    left: `${pacman.x}px`,
                    top: `${pacman.y}px`,
                    width: `${pacman.size}px`,
                    height: `${pacman.size}px`,
                    transform: `translate(-50%, -50%) rotate(${pacman.rotation}deg)`,
                    transition: 'transform 0.1s linear',
                    pointerEvents: 'none',
                    zIndex: 2
                } })] }));
}
;
export default PacmanAnimation;
