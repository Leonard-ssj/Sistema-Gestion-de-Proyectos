"use client"

import { motion, HTMLMotionProps } from "framer-motion"

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Velocidad de la cascada
      delayChildren: 0.1
    }
  }
}

export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    } 
  }
}

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    } 
  }
}

export function FadeInStagger({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeInItem({ children, className, hoverScale = false, ...props }: HTMLMotionProps<"div"> & { hoverScale?: boolean }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={hoverScale ? { scale: 1.02 } : undefined}
      whileTap={hoverScale ? { scale: 0.98 } : undefined}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-5%" }}
      variants={fadeUpVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
