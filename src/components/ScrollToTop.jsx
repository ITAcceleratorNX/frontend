import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_TOP_PATHS = ["/", "/moving", "/about-warehouse-rental", "/cloud-storage"];

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        if (SCROLL_TOP_PATHS.includes(pathname)) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
