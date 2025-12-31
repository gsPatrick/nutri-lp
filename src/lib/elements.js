export const generateOrganicPath = (width, height) => {
    // Simple cubic bezier curve generation for organic feel
    const startY = height * 0.5;
    const c1x = width * 0.3;
    const c1y = height * 0.2;
    const c2x = width * 0.7;
    const c2y = height * 0.8;
    const endX = width;
    const endY = height * 0.5;

    return `M0,${startY} C${c1x},${c1y} ${c2x},${c2y} ${endX},${endY}`;
};

export const randomFloat = (min, max) => Math.random() * (max - min) + min;
