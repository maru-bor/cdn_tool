import tls from "tls";

export async function httpDetect(urlString) {
    try {
        const url = new URL(urlString);

        return await new Promise((resolve) => {
            const socket = tls.connect(
                {
                    host: url.hostname,
                    port: 443,
                    servername: url.hostname,
                    ALPNProtocols: ["h2", "http/1.1"]
                },
                () => {
                    const protocol = socket.alpnProtocol || "unknown";

                    resolve({
                        status: "success",
                        protocol
                    });

                    socket.end();
                }
            );

            socket.on("error", (err) => {
                resolve({
                    status: "error",
                    code: "HTTP_PROTOCOL_DETECTION_FAILED"
                });
            });
        });

    } catch (err) {
        return {
            status: "error",
            code: "HTTP_PROTOCOL_BAD_URL"
        };
    }
}

