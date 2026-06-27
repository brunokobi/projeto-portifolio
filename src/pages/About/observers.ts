import { useInViewport } from "react-in-viewport";

export const useObserver = (ref) =>
  useInViewport(ref, { rootMargin: "-50px" }, { disconnectOnLeave: false }, {});
