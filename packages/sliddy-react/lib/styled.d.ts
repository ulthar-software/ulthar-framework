// import original module declarations
import "styled-components";

// and extend them!
declare module "styled-components" {
    export interface DefaultTheme {
        primaryColor: string;
        accentColor: string;

        backgroundColor: string;
    }
}
