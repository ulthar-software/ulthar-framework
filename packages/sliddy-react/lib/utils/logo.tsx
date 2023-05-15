import { styled } from "styled-components";

const borderDistance = "20px";

const positionMap = {
    tl: {
        top: borderDistance,
        left: borderDistance,
    },
    tr: {
        top: borderDistance,
        right: borderDistance,
    },
    bl: {
        bottom: borderDistance,
        left: borderDistance,
    },
    br: {
        bottom: borderDistance,
        right: borderDistance,
    },
} as const;

export const Logo = styled.img<{ pos: keyof typeof positionMap }>(({ pos }) => {
    return {
        position: "absolute",
        width: "100px",
        height: "100px",
        ...positionMap[pos],
    };
});
