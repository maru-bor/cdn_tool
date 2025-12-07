import tls from "tls";

export async function tlsDetect(urlString) {
    try{
        const url = new URL(urlString);

        return new Promise((resolve) => {
            const options = {
                host: url.hostname,
                port: 443,
                servername: url.hostname,
                rejectUnauthorized: false
            };

            const socket = tls.connect(options, () => {
                const cert = socket.getPeerCertificate();
                const protocol = socket.getProtocol();

                if (!cert || Object.keys(cert).length === 0) {
                    resolve({
                        status: "error",
                        code: "NO_CERTIFICATE"
                    });
                    socket.end();
                    return;
                }

                let daysRemaining = null;
                if (cert.valid_to) {
                    const expiry = new Date(cert.valid_to);
                    const now = new Date();
                    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                    daysRemaining = diff;
                }

                resolve({
                    status: "success",
                    protocol,
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    daysRemaining,
                });

                socket.end();
            });

            socket.on("error", (err) => {
                resolve({
                    status: "error",
                    code: "TLS_CONNECTION_FAILED"
                });
            });
        });
    }catch (err) {
        return {
            status: "error",
            code: "TLS_BAD_URL",
            message: err.message
        };
    }

}
