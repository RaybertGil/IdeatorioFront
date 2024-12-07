import React, { forwardRef, useCallback, useMemo } from "react";
import WordCloud from "react-d3-cloud";

type Word = { text: string; value: number };

type Props = {
  words: Word[];
};

const MAX_FONT_SIZE = 200;
const MIN_FONT_SIZE = 30;
const MAX_FONT_WEIGHT = 700;
const MIN_FONT_WEIGHT = 400;
const MAX_WORDS = 150;

export const WordCloudComponent = forwardRef<HTMLDivElement, Props>(
  ({ words }, ref) => {
    // Component logic will go here
    return (
      <div ref={ref} style={{ width: "900px", height: "500px" }}>
        {/* WordCloud component will go here */}
      </div>
    );
  }
);

WordCloudComponent.displayName = "WordCloud";