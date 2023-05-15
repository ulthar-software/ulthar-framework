import { DivColumn } from "../utils/div-column.js";
import { Heading } from "../utils/heading.js";

interface PresenterProps {
    name: string;
    avatar: string;
    contact: string;
    handle: string;
}

export function Presenter({ name, avatar, handle, contact }: PresenterProps) {
    return (
        <DivColumn
            style={{
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    overflow: "hidden",
                }}
            >
                <img
                    src={avatar}
                    style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                    }}
                />
            </div>

            <Heading>{name}</Heading>
            <p style={{ fontSize: "0.8em" }}>{contact}</p>
            <p style={{ fontSize: "0.8em" }}>{handle}</p>
        </DivColumn>
    );
}
