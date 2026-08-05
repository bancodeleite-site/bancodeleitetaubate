import { motion } from "motion/react";
import { useRef, useState } from "react";

export const ActivityCard = ({ act, index }: { act: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [{ rotateX, rotateY, mouseX, mouseY }, setStyles] = useState({
    rotateX: 0,
    rotateY: 0,
    mouseX: -1000,
    mouseY: -1000
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt calculation
    const rotateX = -((y - centerY) / centerY) * 8;
    const rotateY = ((x - centerX) / centerX) * 8;

    setStyles({ rotateX, rotateY, mouseX: x, mouseY: y });
  };

  const handleMouseLeave = () => {
    setStyles({
      rotateX: 0,
      rotateY: 0,
      mouseX: -1000,
      mouseY: -1000
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      style={{ perspective: "1000px" }}
      className="relative h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX, rotateY }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="h-full relative group cursor-default p-[1.5px] rounded-[1.5rem]"
      >
        {/* Glow background that acts as border */}
        <div 
          className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(34, 197, 94, 0.8), transparent 40%)`
          }}
        />
        
        {/* Card Background and content */}
        <div className="relative bg-[#fbfbfd] rounded-[calc(1.5rem-1.5px)] p-8 z-10 h-full flex flex-col shadow-sm group-hover:shadow-xl group-hover:shadow-black/5 transition-shadow duration-300 border border-gray-100 group-hover:border-transparent">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            {act.icon}
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">{act.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{act.desc}</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
