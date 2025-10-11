import React from "react";
import { LayoutProps } from "../../../../.next/types/app/layout";

const LayoutApp: React.FC<LayoutProps> = ({children}) => {
    return (
        <>
            {children}
        </>
    )
}

export default LayoutApp;