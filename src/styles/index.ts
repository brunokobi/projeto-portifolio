import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    red: {
      500: "#B25068",
    },
    white: {
      400: "rgb(196, 196, 196)",
    },
  },

  fonts: {
    heading: `'Poppins', sans-serif`,
    body: `'Poppins', sans-serif`,
  },
});
