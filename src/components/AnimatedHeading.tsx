import { motion, type Variants } from "framer-motion";
import { Fragment, memo, useMemo } from "react";

/**
 * Props:
 * lines: string[] → each string = one line
 * className?: string
 * once?: boolean
 * blur?: number
 * stagger?: number
 * duration?: number
 */

const AnimatedHeading = ({
  lines = [],
  className = "",
  once = true,
  blur = 10,
  stagger = 0.08,
  duration = 0.7,
  breakOnMobile = true,
}: {
  lines: string[];
  className?: string;
  once?: boolean;
  blur?: number;
  stagger?: number;
  duration?: number;
  breakOnMobile?: boolean;
}) => {
  // 🧠 memoize split words (optimization)
  const splitLines = useMemo(
    () => lines.map((line) => line.split(" ")),
    [lines]
  );

  const container = useMemo(
    () => ({
      hidden: {},
      show: {
        transition: { staggerChildren: stagger },
      },
    }),
    [stagger]
  );

  const word: Variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        y: 24,
        scale: 0.98,
        filter: `blur(${blur}px)`,
      },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          duration,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      },
    }),
    [blur, duration]
  );

  return (
    <motion.h2
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-120px" }}
      className={className}
    >
      {splitLines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 &&
            (breakOnMobile ? (
              <br />
            ) : (
              <>
                <br className="hidden md:block" />
                <span className="inline md:hidden"> </span>
              </>
            ))}
          <span
            className={`inline md:whitespace-nowrap break-words ${
              lineIndex === 0
                ? "text-muted-foreground font-medium"
                : "text-foreground font-semibold"
            }`}
          >
            {line.map((wordText, i) => (
              <Fragment key={i}>
                {i > 0 && " "}
                <motion.span variants={word} className="inline-block">
                  {wordText}
                </motion.span>
              </Fragment>
            ))}
          </span>
        </Fragment>
      ))}
    </motion.h2>
  );
};

export default memo(AnimatedHeading);