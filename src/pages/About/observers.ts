import { RefObject } from "react";
import { useInViewport } from "react-in-viewport";

export const useObserver = (ref: RefObject<HTMLElement | null>) =>
  useInViewport(ref, { rootMargin: "-50px" }, { disconnectOnLeave: false }, {});
