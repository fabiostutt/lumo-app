"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const variants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -24 : 24,
  }),
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const directionRef = useRef(1);

  if (prevPathname.current !== pathname) {
    // 1 = avançando (desliza da direita); -1 = voltando pro dashboard (desliza da esquerda)
    const goingBack = pathname === "/dashboard" && prevPathname.current !== "/dashboard";
    directionRef.current = goingBack ? -1 : 1;
    prevPathname.current = pathname;
  }

  return (
    <AnimatePresence mode="wait" initial={false} custom={directionRef.current}>
      <motion.div
        key={pathname}
        custom={directionRef.current}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex w-full flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
