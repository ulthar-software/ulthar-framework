import styled from "styled-components";

export const TitleHeading = styled.h1(({ theme }) => ({
    fontSize: "88px",
    fontWeight: "800",
    // textTransform: "uppercase",
    fontFamily: theme.headerFontFamily,
    margin: "0 0 1rem 0",
}));

export const Heading = styled.h2(({ theme }) => ({
    fontSize: "72px",
    fontWeight: 700,
    fontFamily: theme.headerFontFamily,
    margin: "0 0 1rem 0",
}));
