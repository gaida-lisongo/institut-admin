import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

const LayoutApp: React.FC<LayoutProps> = ({children}) => {
    return (
        <>
            {children}
        </>
    )
}

export default LayoutApp;