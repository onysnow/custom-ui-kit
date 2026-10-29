import { motion, useReducedMotion, type HTMLMotionProps, type Transition } from "framer-motion";
import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Compact navbar: a frosted pill with a logo, three nav items and a CTA. Hovering "Product" or
 * "Download" grows the pill downwards into a dropdown (the height springs, the dropdown simply
 * appears and is revealed by the growing clip). On phones a burger opens the same menus stacked.
 *
 * Original font: Geist 400 / 500 (Google Fonts), not bundled here.
 */

const FONT = 'Geist, "Geist Sans", Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_FEATURES = '"blwf" on, "cv03" on, "cv04" on, "cv09" on, "cv11" on';

/** Pill height changes (menu open/close): critically damped spring, 0.8s. */
const HEIGHT_SPRING: Transition = { type: "spring", duration: 0.8, bounce: 0 };
/** Every hover colour/background change. */
const HOVER_SPRING: Transition = { type: "spring", duration: 0.4, bounce: 0.2 };

/** Icon geometry (24px grid, 1.5 stroke, round caps): [path, transform] pairs. */
const ICONS = {
  ShieldCheck: [
    [
      "M 16.5 6 L 16.5 0.75 C 16.5 0.336 16.164 0 15.75 0 L 0.75 0 C 0.336 0 0 0.336 0 0.75 L 0 6 C 0 15 8.25 17.25 8.25 17.25 C 8.25 17.25 16.5 15 16.5 6 Z",
      "translate(3.75 4.5)",
    ],
    ["M 0 3 L 2.25 5.25 L 7.5 0", "translate(8.25 9.75)"],
  ],
  BracketsCurly: [
    ["M 6 0 C 0 0 6 8.25 0 8.25 C 6 8.25 0 16.5 6 16.5", "translate(1.5 3.75)"],
    ["M 0 0 C 6 0 0 8.25 6 8.25 C 0 8.25 6 16.5 0 16.5", "translate(16.5 3.75)"],
  ],
  ChartLineUp: [
    ["M 18 15 L 0 15 L 0 0", "translate(3 4.5)"],
    ["M 15.75 0 L 9 6.75 L 6 3.75 L 0 9.75", "translate(3 6.75)"],
    ["M 3.75 3.75 L 3.75 0 L 0 0", "translate(15 6.75)"],
  ],
  Cpu: [
    ["M 0 4.5 L 0 0 L 4.5 0 L 4.5 4.5 Z", "translate(9.75 9.75)"],
    [
      "M 0.75 15 C 0.336 15 0 14.664 0 14.25 L 0 0.75 C 0 0.336 0.336 0 0.75 0 L 14.25 0 C 14.664 0 15 0.336 15 0.75 L 15 14.25 C 15 14.664 14.664 15 14.25 15 Z",
      "translate(4.5 4.5)",
    ],
    ["M 0 0 L 2.25 0", "translate(19.5 9.75)"],
    ["M 0 0 L 2.25 0", "translate(19.5 14.25)"],
    ["M 0 0 L 2.25 0", "translate(2.25 9.75)"],
    ["M 0 0 L 2.25 0", "translate(2.25 14.25)"],
    ["M 0 0 L 0 2.25", "translate(14.25 19.5)"],
    ["M 0 0 L 0 2.25", "translate(9.75 19.5)"],
    ["M 0 0 L 0 2.25", "translate(14.25 2.25)"],
    ["M 0 0 L 0 2.25", "translate(9.75 2.25)"],
  ],
  Graph: [
    ["M 1.172 2.638 L 0 0", "translate(9.914 7.306)"],
    ["M 2.481 0 L 0 0.827", "translate(14.135 10.462)"],
    ["M 3.199 2.488 L 0 0", "translate(13.776 13.381)"],
    ["M 3.386 0 L 0 3.011", "translate(6.932 13.494)"],
    [
      "M 0 2.25 C 0 1.007 1.007 0 2.25 0 C 3.493 0 4.5 1.007 4.5 2.25 C 4.5 3.493 3.493 4.5 2.25 4.5 C 1.007 4.5 0 3.493 0 2.25 Z",
      "translate(9.75 9.75)",
    ],
    [
      "M 0 2.25 C 0 1.007 1.007 0 2.25 0 C 3.493 0 4.5 1.007 4.5 2.25 C 4.5 3.493 3.493 4.5 2.25 4.5 C 1.007 4.5 0 3.493 0 2.25 Z",
      "translate(6.75 3)",
    ],
    [
      "M 0 2.25 C 0 1.007 1.007 0 2.25 0 C 3.493 0 4.5 1.007 4.5 2.25 C 4.5 3.493 3.493 4.5 2.25 4.5 C 1.007 4.5 0 3.493 0 2.25 Z",
      "translate(16.5 7.5)",
    ],
    [
      "M 0 2.25 C 0 1.007 1.007 0 2.25 0 C 3.493 0 4.5 1.007 4.5 2.25 C 4.5 3.493 3.493 4.5 2.25 4.5 C 1.007 4.5 0 3.493 0 2.25 Z",
      "translate(16.5 15)",
    ],
    [
      "M 0 2.25 C 0 1.007 1.007 0 2.25 0 C 3.493 0 4.5 1.007 4.5 2.25 C 4.5 3.493 3.493 4.5 2.25 4.5 C 1.007 4.5 0 3.493 0 2.25 Z",
      "translate(3 15.75)",
    ],
  ],
  PuzzlePiece: [
    [
      "M 4.498 17.999 C 4.083 17.999 3.748 17.663 3.748 17.249 L 3.748 13.246 C 2.645 13.768 1.328 13.461 0.569 12.506 C -0.19 11.55 -0.19 10.197 0.569 9.242 C 1.328 8.286 2.645 7.979 3.748 8.501 L 3.748 4.499 C 3.748 4.084 4.083 3.749 4.498 3.749 L 8.875 3.749 C 8.352 2.646 8.659 1.328 9.615 0.569 C 10.571 -0.19 11.924 -0.19 12.879 0.569 C 13.835 1.328 14.142 2.646 13.62 3.749 L 17.998 3.749 C 18.412 3.749 18.748 4.084 18.748 4.499 L 18.748 8.501 C 17.645 7.979 16.328 8.286 15.569 9.242 C 14.81 10.197 14.81 11.55 15.569 12.506 C 16.328 13.461 17.645 13.768 18.748 13.246 L 18.748 17.249 C 18.748 17.663 18.412 17.999 17.998 17.999 Z",
      "translate(1.502 2.251)",
    ],
  ],
  FolderOpen: [
    [
      "M 0 14.25 L 0 0.75 C 0 0.336 0.336 0 0.75 0 L 5.75 0 C 5.912 0 6.07 0.053 6.2 0.15 L 9 2.25 L 15.75 2.25 C 16.164 2.25 16.5 2.586 16.5 3 L 16.5 5.25",
      "translate(3 5.25)",
    ],
    [
      "M 0 9 L 2.829 0.513 C 2.931 0.207 3.218 0 3.541 0 L 18.75 0 C 18.991 0 19.218 0.116 19.358 0.311 C 19.499 0.507 19.538 0.758 19.462 0.987 L 16.79 9 Z",
      "translate(3 10.5)",
    ],
  ],
} as const satisfies Record<string, ReadonlyArray<readonly [string, string]>>;

export type CompactNavbarIconName = keyof typeof ICONS;

const LOGO_PATH =
  "M 13.058 1.793 C 13.106 1.859 13.153 1.926 13.198 1.993 C 13.245 1.984 13.291 1.974 13.338 1.965 C 14.647 1.734 15.946 1.991 16.845 2.89 C 17.744 3.789 18.001 5.088 17.77 6.397 C 17.762 6.444 17.752 6.491 17.742 6.538 C 17.81 6.584 17.877 6.63 17.943 6.678 C 19.017 7.459 19.736 8.581 19.736 9.868 C 19.736 11.155 19.017 12.277 17.943 13.058 C 17.878 13.105 17.81 13.152 17.742 13.197 C 17.752 13.245 17.762 13.292 17.77 13.339 C 18.001 14.648 17.743 15.946 16.845 16.845 C 15.946 17.744 14.648 18.002 13.339 17.771 C 13.291 17.762 13.245 17.752 13.198 17.742 C 13.152 17.81 13.105 17.877 13.058 17.943 C 12.277 19.017 11.155 19.736 9.868 19.736 C 8.581 19.736 7.459 19.017 6.678 17.943 C 6.63 17.878 6.584 17.81 6.538 17.742 C 6.491 17.752 6.444 17.763 6.397 17.771 C 5.088 18.002 3.789 17.744 2.89 16.846 C 1.992 15.947 1.734 14.648 1.965 13.339 C 1.974 13.291 1.983 13.244 1.993 13.197 C 1.925 13.152 1.858 13.105 1.793 13.058 C 0.718 12.277 0 11.155 0 9.868 C 0 8.581 0.718 7.459 1.793 6.678 C 1.859 6.63 1.925 6.584 1.993 6.539 C 1.984 6.492 1.973 6.445 1.965 6.397 C 1.734 5.088 1.992 3.789 2.89 2.89 C 3.789 1.992 5.088 1.734 6.397 1.965 C 6.444 1.974 6.491 1.983 6.538 1.993 C 6.584 1.925 6.63 1.858 6.678 1.793 C 7.459 0.718 8.581 0 9.868 0 C 11.155 0 12.277 0.718 13.058 1.793 Z M 9.868 16.004 C 9.145 16.649 8.348 17.136 7.541 17.447 C 8.179 18.283 9.003 18.749 9.868 18.749 C 10.732 18.749 11.556 18.283 12.195 17.447 C 11.388 17.135 10.591 16.649 9.868 16.003 Z M 16.827 13.696 C 16.827 13.696 16.827 13.696 16.827 13.696 C 16.827 13.696 16.827 13.696 16.828 13.696 Z M 16.827 13.696 C 16.07 14.03 15.209 14.239 14.294 14.293 C 14.239 15.208 14.03 16.07 13.696 16.827 C 14.707 16.962 15.574 16.721 16.148 16.148 C 16.721 15.573 16.963 14.707 16.827 13.696 Z M 2.909 13.696 C 2.909 13.696 2.909 13.696 2.909 13.696 C 2.909 13.696 2.909 13.696 2.909 13.696 Z M 2.909 13.696 C 2.773 14.707 3.014 15.574 3.588 16.148 C 4.162 16.722 5.029 16.962 6.04 16.827 C 5.706 16.07 5.497 15.208 5.443 14.293 C 4.527 14.238 3.666 14.03 2.909 13.696 Z M 12.231 12.23 C 12.163 12.508 12.073 12.788 11.963 13.066 L 11.995 13.075 L 11.959 13.075 C 11.82 13.424 11.647 13.77 11.443 14.11 C 11.188 14.534 10.894 14.934 10.565 15.304 C 11.247 15.903 11.99 16.334 12.718 16.589 C 13.037 15.925 13.248 15.143 13.305 14.291 C 12.861 14.262 12.43 14.197 12.018 14.1 C 12.18 13.804 12.323 13.499 12.446 13.184 C 12.729 13.242 13.015 13.282 13.303 13.303 C 13.268 12.832 13.186 12.382 13.066 11.962 C 12.794 12.071 12.515 12.16 12.231 12.23 Z M 10.565 4.431 C 10.818 4.716 11.05 5.019 11.261 5.337 C 10.936 5.444 10.624 5.573 10.328 5.719 C 10.188 5.52 10.035 5.323 9.868 5.131 C 9.595 5.444 9.35 5.779 9.137 6.135 C 9.378 6.251 9.611 6.383 9.835 6.531 C 9.759 8.323 8.323 9.759 6.531 9.834 C 6.396 9.629 6.272 9.412 6.159 9.184 C 6.002 8.864 5.866 8.524 5.757 8.167 C 5.591 7.622 5.483 7.038 5.445 6.431 C 4.593 6.488 3.81 6.699 3.147 7.018 C 3.401 7.746 3.832 8.488 4.432 9.17 C 4.723 8.912 5.026 8.68 5.337 8.475 C 5.443 8.795 5.571 9.106 5.72 9.408 C 5.52 9.548 5.323 9.701 5.131 9.868 C 5.444 10.141 5.78 10.385 6.135 10.599 C 6.252 10.358 6.384 10.125 6.531 9.901 C 8.323 9.976 9.759 11.412 9.835 13.205 C 9.632 13.337 9.419 13.46 9.194 13.572 C 8.869 13.732 8.532 13.866 8.185 13.973 C 7.635 14.143 7.045 14.252 6.431 14.291 C 6.489 15.143 6.699 15.925 7.018 16.589 C 7.746 16.334 8.489 15.903 9.171 15.304 C 8.913 15.013 8.681 14.709 8.475 14.399 C 8.801 14.291 9.113 14.163 9.409 14.016 C 9.552 14.22 9.705 14.416 9.868 14.604 C 10.15 14.28 10.394 13.943 10.599 13.6 C 10.354 13.482 10.121 13.349 9.901 13.205 C 9.977 11.412 11.413 9.976 13.206 9.901 C 13.339 10.104 13.46 10.315 13.567 10.532 C 13.772 10.945 13.934 11.378 14.052 11.823 C 14.18 12.308 14.26 12.804 14.292 13.305 C 15.143 13.247 15.926 13.037 16.589 12.718 C 16.335 11.99 15.903 11.247 15.304 10.565 C 15.013 10.823 14.71 11.055 14.399 11.26 C 14.292 10.935 14.163 10.623 14.017 10.327 C 14.22 10.184 14.416 10.031 14.604 9.868 C 14.28 9.586 13.943 9.342 13.601 9.137 C 13.482 9.382 13.35 9.615 13.206 9.834 C 11.413 9.759 9.977 8.323 9.901 6.531 C 10.097 6.402 10.304 6.283 10.52 6.175 C 10.849 6.01 11.2 5.87 11.57 5.757 C 12.134 5.586 12.717 5.481 13.305 5.445 C 13.248 4.593 13.037 3.81 12.718 3.146 C 11.99 3.401 11.247 3.832 10.565 4.431 Z M 3.147 12.718 C 3.811 13.036 4.593 13.247 5.445 13.305 C 5.473 12.861 5.538 12.43 5.636 12.017 C 5.931 12.18 6.237 12.323 6.552 12.445 C 6.495 12.721 6.455 13.008 6.433 13.303 C 6.905 13.268 7.354 13.186 7.773 13.066 C 7.662 12.788 7.573 12.508 7.505 12.231 C 7.227 12.163 6.947 12.074 6.67 11.963 L 6.661 11.995 L 6.661 11.959 C 6.301 11.815 5.943 11.636 5.593 11.423 C 5.181 11.173 4.792 10.885 4.431 10.565 C 3.832 11.247 3.402 11.99 3.147 12.718 Z M 17.447 7.54 C 17.135 8.347 16.649 9.145 16.003 9.867 C 16.649 10.59 17.136 11.388 17.447 12.195 C 18.283 11.556 18.749 10.732 18.749 9.868 C 18.749 9.003 18.283 8.178 17.447 7.541 Z M 0.987 9.868 C 0.987 10.731 1.453 11.557 2.288 12.195 C 2.6 11.388 3.087 10.591 3.732 9.868 C 3.087 9.145 2.6 8.348 2.289 7.541 C 1.453 8.179 0.987 9.003 0.987 9.868 Z M 14.292 6.431 C 14.263 6.875 14.198 7.306 14.101 7.719 C 13.8 7.553 13.493 7.41 13.184 7.29 C 13.242 7.007 13.282 6.721 13.303 6.433 C 12.832 6.467 12.382 6.549 11.963 6.67 C 12.073 6.947 12.163 7.227 12.231 7.505 C 12.515 7.575 12.794 7.665 13.066 7.773 L 13.075 7.741 L 13.075 7.777 C 13.438 7.922 13.799 8.102 14.151 8.317 C 14.56 8.566 14.946 8.852 15.304 9.17 C 15.903 8.488 16.334 7.746 16.589 7.018 C 15.926 6.699 15.143 6.488 14.292 6.43 Z M 6.431 5.445 C 6.865 5.472 7.296 5.535 7.719 5.635 C 7.556 5.93 7.413 6.236 7.291 6.55 C 7.015 6.494 6.728 6.455 6.433 6.433 C 6.468 6.904 6.55 7.354 6.67 7.773 C 6.947 7.662 7.227 7.573 7.504 7.505 C 7.574 7.221 7.664 6.941 7.772 6.669 C 7.762 6.666 7.752 6.664 7.742 6.661 L 7.777 6.661 C 7.927 6.288 8.108 5.928 8.317 5.584 C 8.567 5.175 8.852 4.79 9.17 4.431 C 8.488 3.832 7.746 3.401 7.018 3.147 C 6.699 3.81 6.489 4.593 6.431 5.445 Z M 14.294 5.443 C 15.209 5.497 16.071 5.706 16.827 6.04 C 16.963 5.029 16.721 4.162 16.148 3.588 C 15.573 3.014 14.707 2.773 13.696 2.909 C 14.03 3.665 14.239 4.527 14.294 5.443 Z M 2.909 6.04 C 3.665 5.706 4.527 5.497 5.442 5.443 C 5.497 4.527 5.706 3.665 6.04 2.909 C 5.029 2.772 4.161 3.014 3.587 3.588 C 3.014 4.162 2.773 5.029 2.909 6.04 Z M 7.541 2.289 C 8.348 2.6 9.145 3.087 9.868 3.732 C 10.591 3.087 11.388 2.599 12.195 2.288 C 11.556 1.453 10.732 0.987 9.868 0.987 C 9.004 0.987 8.179 1.453 7.541 2.289 Z";

const OS_ICONS = {
  macos: {
    viewBox: "0 0 13.563 15.901",
    width: 14,
    height: 16,
    path: "M 9.231 2.539 C 9.813 1.867 10.205 0.931 10.098 0 C 9.26 0.032 8.246 0.533 7.645 1.205 C 7.105 1.8 6.634 2.752 6.761 3.664 C 7.696 3.734 8.65 3.211 9.232 2.539 Z M 11.328 8.448 C 11.309 6.436 13.048 5.469 13.128 5.422 C 12.149 4.054 10.625 3.866 10.082 3.845 C 8.785 3.719 7.551 4.574 6.892 4.574 C 6.235 4.574 5.219 3.863 4.144 3.883 C 2.729 3.902 1.427 4.667 0.697 5.876 C -0.771 8.308 0.322 11.913 1.753 13.887 C 2.452 14.853 3.287 15.939 4.383 15.9 C 5.438 15.86 5.837 15.249 7.111 15.249 C 8.387 15.249 8.746 15.9 9.861 15.881 C 10.996 15.859 11.717 14.895 12.411 13.927 C 13.214 12.806 13.545 11.721 13.563 11.665 C 13.538 11.655 11.352 10.854 11.328 8.448 Z",
  },
  windows: {
    viewBox: "0 0 16 16",
    width: 16,
    height: 16,
    path: "M 7.33 14.775 C 10.221 15.166 13.112 15.569 15.998 16 C 15.998 13.479 16.002 10.969 15.998 8.57 C 13.105 8.57 10.212 8.347 7.317 8.347 C 7.321 9.947 7.325 12.663 7.33 14.775 Z M 0 13.778 C 2.181 14.071 4.362 14.354 6.538 14.674 C 6.542 12.574 6.536 10.473 6.536 8.372 C 4.358 8.376 2.179 8.341 0 8.348 Z M 0 7.689 C 2.181 7.694 4.362 7.662 6.542 7.664 C 6.54 5.568 6.54 3.475 6.538 1.379 C 4.356 1.651 2.174 1.941 0 2.275 Z M 16 7.578 C 15.998 5.051 16 2.526 15.998 0 C 13.106 0.398 10.216 0.817 7.33 1.255 C 7.328 3.384 7.328 5.511 7.33 7.642 C 10.221 7.633 13.11 7.589 16 7.578 Z",
  },
  linux: {
    viewBox: "0 0 16 16",
    width: 16,
    height: 16,
    path: "M 9.775 5.569 C 9.495 5.755 8.608 6.235 8.475 6.362 C 8.263 6.567 7.926 6.567 7.715 6.362 C 7.581 6.255 6.695 5.749 6.415 5.569 C 6.135 5.389 6.115 5.102 6.468 4.955 C 7.512 4.502 8.697 4.502 9.741 4.955 C 10.068 5.095 10.081 5.355 9.741 5.555 M 14.555 10.409 C 13.942 9.021 13.086 7.755 12.028 6.669 C 11.69 6.317 11.447 5.886 11.321 5.415 C 11.255 5.195 11.208 4.969 11.161 4.749 C 11.078 4.143 10.921 3.55 10.695 2.982 C 10.26 1.96 9.245 1.307 8.135 1.335 C 7.016 1.294 5.98 1.923 5.501 2.935 C 5.363 3.22 5.26 3.52 5.195 3.829 C 5.081 4.335 4.981 4.862 4.861 5.375 C 4.758 5.813 4.526 6.21 4.195 6.515 C 3.136 7.549 2.261 8.755 1.608 10.082 C 1.51 10.271 1.428 10.467 1.361 10.669 C 1.235 11.109 1.555 11.415 2.028 11.335 C 2.321 11.275 2.615 11.215 2.895 11.129 C 3.175 11.042 3.275 11.129 3.341 11.362 C 3.741 12.761 4.795 13.879 6.168 14.362 C 8.915 15.402 12.121 13.922 12.835 11.309 C 12.881 11.129 12.948 11.062 13.148 11.129 C 13.455 11.222 13.768 11.289 14.081 11.362 C 14.22 11.403 14.371 11.378 14.49 11.295 C 14.609 11.212 14.684 11.08 14.695 10.935 C 14.702 10.766 14.666 10.599 14.588 10.449",
  },
} as const;

export interface CompactNavbarMenuItem {
  title: string;
  description?: string;
  href?: string;
  newTab?: boolean;
  /** Built-in icon name, or any element sized to 16px. */
  icon?: CompactNavbarIconName | React.ReactNode;
}

export interface CompactNavbarDownloadItem {
  os: "macos" | "windows" | "linux";
  title: string;
  description: string;
  href?: string;
  newTab?: boolean;
  /** Small pill on the right, e.g. "65.000+ Installs". */
  badge?: string;
}

export type CompactNavbarMenu = "closed" | "product" | "download";

export interface CompactNavbarProps extends Omit<HTMLMotionProps<"nav">, "children" | "layout"> {
  /**
   * "desktop" shows the nav items and opens dropdowns on hover. "phone" shows a burger that opens
   * the menus stacked. "auto" switches to phone when narrower than 440px.
   */
  layout?: "desktop" | "phone" | "auto";
  /** Logo graphic (20px box). Defaults to the sample mark. */
  logo?: React.ReactNode;
  logoHref?: string;
  productLabel?: string;
  downloadLabel?: string;
  pricingLabel?: string;
  pricingHref?: string;
  productItems?: CompactNavbarMenuItem[];
  /** Primary download is full width; the rest share a row with `allVersions`. */
  downloadItems?: CompactNavbarDownloadItem[];
  allVersions?: CompactNavbarMenuItem;
  ctaLabel?: string;
  ctaHref?: string;
  /** Controlled dropdown (desktop). */
  menu?: CompactNavbarMenu;
  defaultMenu?: CompactNavbarMenu;
  onMenuChange?: (menu: CompactNavbarMenu) => void;
  /** Controlled burger menu (phone). */
  mobileOpen?: boolean;
  defaultMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

const DEFAULT_PRODUCT_ITEMS: CompactNavbarMenuItem[] = [
  { title: "Pipelines", description: "Connect any stack, zero config", icon: "Graph", href: "#" },
  {
    title: "Observability",
    description: "Logs, traces and alerts in one view",
    icon: "ChartLineUp",
    href: "#",
  },
  { title: "Edge Runtime", description: "Deploy globally in milliseconds", icon: "Cpu", href: "#" },
  {
    title: "Access Control",
    description: "Roles and permissions at scale",
    icon: "ShieldCheck",
    href: "#",
  },
  {
    title: "API Gateway",
    description: "Rate limiting, auth, routing done",
    icon: "BracketsCurly",
    href: "#",
  },
  {
    title: "Integrations",
    description: "150+ connectors, ready to use",
    icon: "PuzzlePiece",
    href: "#",
  },
];

const DEFAULT_DOWNLOAD_ITEMS: CompactNavbarDownloadItem[] = [
  {
    os: "macos",
    title: "Download for MacOS",
    description: "Latest Version 3.1.0 - Universal binary",
    badge: "65.000+ Installs",
    href: "#",
  },
  { os: "windows", title: "Windows", description: "v3.1.0 - x64", href: "#" },
  { os: "linux", title: "Linux", description: ".deb - .rpm", href: "#" },
];

const DEFAULT_ALL_VERSIONS: CompactNavbarMenuItem = {
  title: "All Versions",
  description: "Access betas & more",
  icon: "FolderOpen",
  href: "#",
};

const externalProps = (newTab?: boolean) =>
  newTab ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};

/** Stroke icon on the 24px grid. */
function PathIcon({ name, size = 16 }: { name: CompactNavbarIconName; size?: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="rgb(255, 255, 255)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flex: "none" }}
    >
      {ICONS[name].map(([d, transform]) => (
        <path key={d + transform} d={d} transform={transform} />
      ))}
    </svg>
  );
}

function renderIcon(icon: CompactNavbarMenuItem["icon"]) {
  if (typeof icon === "string" && icon in ICONS) return <PathIcon name={icon as never} />;
  return icon ?? null;
}

/** Hover or keyboard focus. */
function useActive() {
  const [active, setActive] = useState(false);
  return {
    active,
    handlers: {
      onPointerEnter: () => setActive(true),
      onPointerLeave: () => setActive(false),
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        if (event.currentTarget.matches(":focus-visible")) setActive(true);
      },
      onBlur: () => setActive(false),
    },
  };
}

const text14 = {
  fontFamily: FONT,
  fontSize: 14,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  color: "rgb(255, 255, 255)",
} as const;

/** Translucent card used by menu items, download items and the pricing link. */
const CARD_BASE = {
  borderRadius: 14,
  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
} as const;
const CARD_REST = "rgba(255, 255, 255, 0.08)";
const CARD_HOVER = "rgba(255, 255, 255, 0.18)";

function MenuItem({
  item,
  compact,
  transition,
}: {
  item: CompactNavbarMenuItem;
  /** Phone variant: title only, no description. */
  compact: boolean;
  transition: Transition;
}) {
  const { active, handlers } = useActive();
  return (
    <motion.a
      href={item.href}
      {...externalProps(item.newTab)}
      {...handlers}
      className="relative flex w-full cursor-pointer flex-col items-start justify-center overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      initial={false}
      animate={{ backgroundColor: active ? CARD_HOVER : CARD_REST }}
      transition={transition}
      style={{ ...CARD_BASE, gap: 6, padding: 12 }}
    >
      <span className="flex w-full flex-none items-center justify-start" style={{ gap: 8 }}>
        {renderIcon(item.icon)}
        <span style={{ ...text14, flex: "1 0 0", width: 1, fontWeight: 500 }}>{item.title}</span>
      </span>
      {!compact && item.description && (
        <span
          className="flex w-full flex-none items-center justify-center"
          style={{ paddingLeft: 24 }}
        >
          <span
            style={{
              ...text14,
              flex: "1 0 0",
              width: 1,
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {item.description}
          </span>
        </span>
      )}
    </motion.a>
  );
}

function OsIcon({ os }: { os: CompactNavbarDownloadItem["os"] }) {
  const icon = OS_ICONS[os];
  return (
    <svg
      aria-hidden
      viewBox={icon.viewBox}
      width={icon.width}
      height={icon.height}
      style={{ display: "block", flex: "none" }}
    >
      <path d={icon.path} fill="rgb(255, 255, 255)" />
    </svg>
  );
}

function DownloadItem({
  item,
  transition,
}: {
  item: CompactNavbarDownloadItem;
  transition: Transition;
}) {
  const { active, handlers } = useActive();
  return (
    <motion.a
      href={item.href}
      {...externalProps(item.newTab)}
      {...handlers}
      className="relative flex w-full min-w-0 flex-1 cursor-pointer items-center justify-center overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      initial={false}
      animate={{ backgroundColor: active ? CARD_HOVER : CARD_REST }}
      transition={transition}
      style={{ ...CARD_BASE, gap: 16, padding: 12 }}
    >
      <span className="flex min-w-0 flex-1 flex-col items-center justify-center" style={{ gap: 4 }}>
        <span className="flex w-full flex-none items-center justify-center" style={{ gap: 8 }}>
          <OsIcon os={item.os} />
          <span style={{ ...text14, flex: "1 0 0", width: 1, fontWeight: 500 }}>{item.title}</span>
        </span>
        <span
          className="flex w-full flex-none items-center justify-center"
          style={{ paddingLeft: 24 }}
        >
          <span
            style={{
              ...text14,
              flex: "1 0 0",
              width: 1,
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            {item.description}
          </span>
        </span>
      </span>
      {item.badge && (
        <span
          className="flex flex-none items-center justify-center overflow-hidden"
          style={{
            padding: "6px 16px",
            borderRadius: 24,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <span style={{ ...text14, fontSize: 12, whiteSpace: "pre" }}>{item.badge}</span>
        </span>
      )}
    </motion.a>
  );
}

type NavItemState = "default" | "active" | "inactive";

const NAV_ITEM_COLOR: Record<NavItemState, string> = {
  default: "rgba(255, 255, 255, 0.8)",
  active: "rgb(255, 255, 255)",
  inactive: "rgba(255, 255, 255, 0.5)",
};

/** Top-level link: dimmed when another dropdown is open, white when hovered or open. */
function NavItem({
  label,
  caret,
  state,
  transition,
  href,
  onEnter,
  onActivate,
  expanded,
  controls,
}: {
  label: string;
  caret?: boolean;
  state: NavItemState;
  transition: Transition;
  href?: string;
  /** Pointer enters or the item takes focus. */
  onEnter: () => void;
  onActivate?: () => void;
  expanded?: boolean;
  controls?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const color = hovered ? NAV_ITEM_COLOR.active : NAV_ITEM_COLOR[state];
  const shared = {
    className:
      "flex h-full flex-none cursor-pointer items-center justify-center overflow-hidden rounded-md no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60",
    style: { gap: 4, padding: "6px 8px", background: "none", border: 0, font: "inherit" },
    onPointerEnter: () => {
      setHovered(true);
      onEnter();
    },
    onPointerLeave: () => setHovered(false),
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(":focus-visible")) onEnter();
    },
  } as const;
  const content = (
    <>
      <motion.span
        initial={false}
        animate={{ color }}
        transition={transition}
        style={{
          fontFamily: FONT,
          fontSize: 14,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          fontFeatureSettings: FONT_FEATURES,
          whiteSpace: "pre",
        }}
      >
        {label}
      </motion.span>
      {caret && (
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          width={14}
          height={14}
          style={{ display: "block", flex: "none" }}
        >
          <motion.path
            d="M 3 5.5 L 7 9.5 L 11 5.5"
            fill="none"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ stroke: color }}
            transition={transition}
          />
        </svg>
      )}
    </>
  );
  return href !== undefined ? (
    <a href={href} {...shared}>
      {content}
    </a>
  ) : (
    <button
      type="button"
      aria-haspopup="true"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onActivate}
      {...shared}
    >
      {content}
    </button>
  );
}

/** Burger / close glyph (the original swaps the "List" and "X" icons without animating). */
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="rgb(255, 255, 255)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flex: "none" }}
    >
      {open ? (
        <>
          <path d="M 13.5 0 L 0 13.5" transform="translate(5.25 5.25)" />
          <path d="M 13.5 13.5 L 0 0" transform="translate(5.25 5.25)" />
        </>
      ) : (
        <>
          <path d="M 0 0 L 16.5 0" transform="translate(3.75 12)" />
          <path d="M 0 0 L 16.5 0" transform="translate(3.75 6)" />
          <path d="M 0 0 L 16.5 0" transform="translate(3.75 18)" />
        </>
      )}
    </svg>
  );
}

function MenuTitle({ children }: { children: string }) {
  return (
    <div className="flex w-full flex-none items-center justify-center" style={{ paddingLeft: 8 }}>
      <span style={{ ...text14, flex: "1 0 0", width: 1, color: "rgba(255, 255, 255, 0.7)" }}>
        {children}
      </span>
    </div>
  );
}

export function CompactNavbar({
  layout = "desktop",
  logo,
  logoHref = "#",
  productLabel = "Product",
  downloadLabel = "Download",
  pricingLabel = "Pricing",
  pricingHref = "#",
  productItems = DEFAULT_PRODUCT_ITEMS,
  downloadItems = DEFAULT_DOWNLOAD_ITEMS,
  allVersions = DEFAULT_ALL_VERSIONS,
  ctaLabel = "Free Trial",
  ctaHref = "#",
  menu: menuProp,
  defaultMenu = "closed",
  onMenuChange,
  mobileOpen: mobileOpenProp,
  defaultMobileOpen = false,
  onMobileOpenChange,
  className,
  style,
  onPointerLeave,
  onKeyDown,
  ...props
}: CompactNavbarProps) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const [innerMenu, setInnerMenu] = useState<CompactNavbarMenu>(defaultMenu);
  const menu = menuProp ?? innerMenu;
  const setMenu = (next: CompactNavbarMenu) => {
    if (next === menu) return;
    if (menuProp === undefined) setInnerMenu(next);
    onMenuChange?.(next);
  };

  const [innerMobileOpen, setInnerMobileOpen] = useState(defaultMobileOpen);
  const mobileOpen = mobileOpenProp ?? innerMobileOpen;
  const setMobileOpen = (next: boolean) => {
    if (next === mobileOpen) return;
    if (mobileOpenProp === undefined) setInnerMobileOpen(next);
    onMobileOpenChange?.(next);
  };

  const [autoPhone, setAutoPhone] = useState(false);
  useEffect(() => {
    const node = rootRef.current;
    if (!node || layout !== "auto") return;
    const observer = new ResizeObserver(
      ([entry]) => entry && setAutoPhone(entry.contentRect.width < 440),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout]);
  const phone = layout === "phone" || (layout === "auto" && autoPhone);

  // The pill's height follows its content; the first measurement is applied without animating.
  const [height, setHeight] = useState<number | null>(null);
  const [settled, setSettled] = useState(false);
  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (height !== null) setSettled(true);
  }, [height]);

  const none: Transition = { duration: 0 };
  const t = (value: Transition) => (reduceMotion ? none : value);
  const hover = t(HOVER_SPRING);

  const showProduct = phone ? mobileOpen : menu === "product";
  const showDownload = phone ? mobileOpen : menu === "download";
  const productId = `${baseId}-product`;
  const downloadId = `${baseId}-download`;

  const itemState = (own: CompactNavbarMenu): NavItemState =>
    menu === "closed" ? "default" : menu === own ? "active" : "inactive";

  const logoNode = logo ?? (
    <svg
      aria-hidden
      viewBox="0 0 19.736 19.736"
      width={20}
      height={20}
      style={{ display: "block", flex: "none" }}
    >
      <path d={LOGO_PATH} fill="rgb(255, 255, 255)" />
    </svg>
  );

  const [primaryDownload, ...otherDownloads] = downloadItems;

  return (
    <motion.nav
      {...props}
      ref={rootRef}
      aria-label={props["aria-label"] ?? "Main"}
      className={cn("relative flex flex-col items-center", className)}
      initial={false}
      {...(height === null ? {} : { animate: { height } })}
      transition={settled ? t(HEIGHT_SPRING) : none}
      onPointerLeave={(event) => {
        // Moving out of the pill closes a hover dropdown (desktop).
        if (!phone) setMenu("closed");
        onPointerLeave?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMenu("closed");
          setMobileOpen(false);
        }
        onKeyDown?.(event);
      }}
      style={{
        overflow: "clip",
        borderRadius: 23,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        background: "linear-gradient(180deg, rgba(0, 0, 0, 0.16) 0%, rgba(0, 0, 0, 0.4) 100%)",
        boxShadow:
          "0px 0px 33px 0px rgba(0, 0, 0, 0.04), inset 0px 0px 5px 0px rgba(255, 255, 255, 0.3)",
        willChange: "transform",
        ...style,
      }}
    >
      <div ref={innerRef} className="flex w-full flex-col items-center justify-center">
        <div className="flex w-full flex-none items-center justify-between">
          <div
            className="flex flex-none items-center justify-start overflow-hidden"
            style={{ gap: 10, padding: "8px 0 8px 8px" }}
            onPointerEnter={() => !phone && setMenu("closed")}
          >
            <a
              href={logoHref}
              aria-label="Home"
              className="flex flex-none items-center justify-center overflow-hidden rounded-md no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              style={{ gap: 6, height: 24, padding: "6px 16px 6px 6px" }}
            >
              {logoNode}
            </a>
          </div>

          {!phone && (
            <Fragment>
              <div
                aria-hidden
                className="self-stretch overflow-hidden"
                style={{ flex: "1 0 0", width: 1 }}
                onPointerEnter={() => setMenu("closed")}
              />
              <div className="flex flex-none items-center justify-center self-stretch overflow-hidden">
                <NavItem
                  label={productLabel}
                  caret
                  state={itemState("product")}
                  transition={hover}
                  onEnter={() => setMenu("product")}
                  onActivate={() => setMenu(menu === "product" ? "closed" : "product")}
                  expanded={menu === "product"}
                  controls={productId}
                />
                <NavItem
                  label={downloadLabel}
                  caret
                  state={itemState("download")}
                  transition={hover}
                  onEnter={() => setMenu("download")}
                  onActivate={() => setMenu(menu === "download" ? "closed" : "download")}
                  expanded={menu === "download"}
                  controls={downloadId}
                />
                <NavItem
                  label={pricingLabel}
                  state={itemState("closed")}
                  transition={hover}
                  href={pricingHref}
                  onEnter={() => setMenu("closed")}
                />
              </div>
              <div
                aria-hidden
                className="self-stretch overflow-hidden"
                style={{ flex: "1 0 0", width: 1 }}
                onPointerEnter={() => setMenu("closed")}
              />
            </Fragment>
          )}

          <div
            className="flex flex-none items-center justify-center overflow-hidden"
            style={{ gap: 8, padding: "8px 8px 8px 0" }}
            onPointerEnter={() => !phone && setMenu("closed")}
          >
            <CtaButton label={ctaLabel} href={ctaHref} transition={hover} />
            {phone && (
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex flex-none cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{ gap: 10, padding: "4px 6px 4px 4px" }}
              >
                <BurgerIcon open={mobileOpen} />
              </button>
            )}
          </div>
        </div>

        {showProduct && (
          <div
            id={productId}
            className="flex w-full flex-none flex-col items-center justify-center"
            style={{ gap: 8, padding: 8 }}
          >
            {phone && <MenuTitle>{productLabel}</MenuTitle>}
            <div
              className="grid w-full"
              style={{
                gap: phone ? "4px 4px" : "8px 8px",
                gridTemplateColumns: "repeat(2, minmax(50px, 1fr))",
                alignItems: "start",
              }}
            >
              {productItems.map((item) => (
                <MenuItem key={item.title} item={item} compact={phone} transition={hover} />
              ))}
            </div>
          </div>
        )}

        {showDownload && (
          <div
            id={downloadId}
            className="flex w-full flex-none flex-col items-start justify-center"
            style={{ gap: 8, padding: 8 }}
          >
            {phone && <MenuTitle>{downloadLabel}</MenuTitle>}
            <div
              className="flex w-full flex-none flex-col items-center justify-center"
              style={{ gap: phone ? 4 : 8 }}
            >
              {primaryDownload && (
                <div className="flex w-full flex-none">
                  <DownloadItem item={primaryDownload} transition={hover} />
                </div>
              )}
              <div
                className="flex w-full flex-none items-center justify-center"
                style={{ gap: phone ? 4 : 8, flexDirection: phone ? "column" : "row" }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    gap: phone ? 4 : 8,
                    flex: phone ? "none" : "1 0 0",
                    width: phone ? "100%" : 1,
                  }}
                >
                  {otherDownloads.map((item) => (
                    <DownloadItem key={item.os} item={item} transition={hover} />
                  ))}
                </div>
                <div
                  className="flex"
                  style={{ flex: phone ? "none" : "1 0 0", width: phone ? "100%" : 1 }}
                >
                  <MenuItem item={allVersions} compact={phone} transition={hover} />
                </div>
              </div>
            </div>
          </div>
        )}

        {phone && mobileOpen && (
          <div
            className="flex w-full flex-none items-center justify-center"
            style={{ gap: 10, padding: 8 }}
          >
            <PricingCard label="See Pricing" href={pricingHref} />
          </div>
        )}
      </div>

      {/* 1px frame above the content, as in the original. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ borderRadius: "inherit", boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.24)" }}
      />
    </motion.nav>
  );
}

function CtaButton({
  label,
  href,
  transition,
}: {
  label: string;
  href: string;
  transition: Transition;
}) {
  const { active, handlers } = useActive();
  return (
    <motion.a
      href={href}
      {...handlers}
      className="relative flex flex-none cursor-pointer items-center justify-center overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      initial={false}
      animate={{ backgroundColor: active ? CARD_HOVER : CARD_REST }}
      transition={transition}
      style={{
        gap: 10,
        padding: "6px 16px",
        borderRadius: 24,
        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.12)",
      }}
    >
      <span style={{ ...text14, whiteSpace: "pre" }}>{label}</span>
    </motion.a>
  );
}

/** Phone-only link under the menus. The original card has no hover state. */
function PricingCard({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="relative flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      style={{ ...CARD_BASE, backgroundColor: CARD_REST, gap: 6, padding: 12, flex: "1 0 0" }}
    >
      <span style={{ ...text14, whiteSpace: "pre" }}>{label}</span>
    </a>
  );
}

export default CompactNavbar;
