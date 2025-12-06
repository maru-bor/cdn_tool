import fetch from "node-fetch";

export async function performanceTest(urlString) {
    try {
        const url = new URL(urlString);

        const startTime = Date.now();

        const ttfbStart = Date.now();
        const res = await fetch(url.href);
        const ttfb = Date.now() - ttfbStart;


        return {
            status: "success",
            ttfb
        };

    } catch (err) {
        return {
            status: "error",
            code: "PERFORMANCE_TEST_FAILED"
        };
    }
}