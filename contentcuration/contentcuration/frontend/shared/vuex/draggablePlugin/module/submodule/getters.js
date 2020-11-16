import { DraggableFlags } from '../constants';
import { bitMaskToObject } from '../utils';

export function isInActiveDraggableUniverse(state, getters, rootState) {
  /**
   * @param {string} id
   * @return {Boolean}
   */
  return function(universe) {
    return universe === rootState.draggable.activeDraggableUniverse;
  };
}

/**
 * @return {String|null}
 */
export function activeDraggableId(state) {
  return state.activeDraggable.id;
}

/**
 * @return {String|null}
 */
export function hoverDraggableId(state) {
  return state.hoverDraggable.id;
}

export function isHoverDraggableAncestor(state) {
  /**
   * @param {Object} identity
   * @return {Boolean}
   */
  return function(identity) {
    const ancestors = state.hoverDraggable.ancestors || [];
    return Boolean(ancestors.find(a => a.id === identity.id && a.type === identity.type));
  };
}

/**
 * Determines the section of which we should register potential placement of
 * the current draggable items.
 */
export function draggingTargetSection(state, getters, rootState) {
  let section = DraggableFlags.NONE;
  const { lastHoverDraggableId, hoverDraggableSection, lastHoverDraggableSection } = state;
  const { draggableDirection } = rootState.draggable;

  // If no section is being hovered over, so no target section should be displayed
  if (hoverDraggableSection === DraggableFlags.NONE) {
    return section;
  }

  // Get all booleans for hover section and direction flags
  const hoverSection = bitMaskToObject(hoverDraggableSection);
  const direction = bitMaskToObject(draggableDirection);

  // When the user has dragged from outside of the universe, or is dragging from the area of the
  // item that has just started dragging.
  if (!lastHoverDraggableId) {
    // If it's an entrance, we want to target the same section that the user
    // has entered through dragging
    section ^= hoverSection.top ? DraggableFlags.TOP : DraggableFlags.BOTTOM;
    section ^= hoverSection.left ? DraggableFlags.LEFT : DraggableFlags.RIGHT;
  } else {
    // We'll use the last hover section to determine if the user has changed directions
    // within a dropzone and therefore to retarget appropriately when they cross the
    // boundary of a section
    const lastHoverSection = bitMaskToObject(lastHoverDraggableSection);

    if (lastHoverSection.bottom || (!lastHoverSection.any && hoverSection.bottom && direction.up)) {
      section ^= DraggableFlags.TOP;
    } else if (
      lastHoverSection.top ||
      (!lastHoverSection.any && hoverSection.top && direction.down)
    ) {
      section ^= DraggableFlags.BOTTOM;
    }

    if (lastHoverSection.right || (hoverSection.right && direction.left)) {
      section ^= DraggableFlags.LEFT;
    } else if (lastHoverSection.left || (hoverSection.left && direction.right)) {
      section ^= DraggableFlags.RIGHT;
    }
  }

  return section;
}