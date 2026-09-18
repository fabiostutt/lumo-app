"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Heurística simples: ir para /dashboard é sempre "voltar" nesse app
  // (todas as outras telas partem dele e retornam a ele).
  const isBack = pathname === "/dashboard" && prevPathname.current !== "/dashboard";
  prevPathname.current = pathname;

  const enterX = isBack ? -24 : 24;
  const exitX = isBack ? 24 : -24;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: enterX }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: exitX }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="flex w-full flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
