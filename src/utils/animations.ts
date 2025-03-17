
// This file contains helper functions for animations

/**
 * Creates a staggered animation delay for multiple elements
 * @param baseDelay - The base delay in milliseconds
 * @param increment - The increment between each element in milliseconds
 * @param count - The number of elements
 * @returns An array of delay values in seconds
 */
export const createStaggeredDelays = (baseDelay = 100, increment = 100, count = 5): string[] => {
  return Array.from({ length: count }, (_, i) => `${(baseDelay + i * increment) / 1000}s`);
};

/**
 * Checks if the element is in viewport
 * @param element - The DOM element to check
 * @param offset - Offset to trigger earlier
 * @returns Boolean indicating if element is in viewport
 */
export const isInViewport = (element: HTMLElement, offset = 0): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
    rect.bottom >= 0 + offset &&
    rect.left <= (window.innerWidth || document.documentElement.clientWidth) - offset &&
    rect.right >= 0 + offset
  );
};

/**
 * Smoothly scrolls to an element
 * @param elementId - The ID of the element to scroll to
 * @param offset - Offset from the top in pixels
 * @param duration - Duration of the scroll animation in milliseconds
 */
export const scrollToElement = (elementId: string, offset = 0, duration = 1000): void => {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) return;

  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  };

  // Easing function
  const ease = (t: number, b: number, c: number, d: number): number => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  requestAnimationFrame(animation);
};

/**
 * Parallax effect for mouse movement
 * @param event - Mouse event
 * @param element - The element to apply parallax to
 * @param intensity - Intensity of the effect (0-1)
 */
export const applyParallaxEffect = (
  event: MouseEvent,
  element: HTMLElement,
  intensity = 0.05
): void => {
  const { clientX, clientY } = event;
  const { left, top, width, height } = element.getBoundingClientRect();
  
  const x = (clientX - left) / width - 0.5;
  const y = (clientY - top) / height - 0.5;
  
  const moveX = x * 20 * intensity;
  const moveY = y * 20 * intensity;
  
  element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
};
