import { dnsLookup } from '../modules/dnsLookup.js';

describe("CDN Tool Testing", () => {

    test("dnsLookup returns valid IPs for a known domain", async () => {
        const result = await dnsLookup("github.com");
        expect(result.status).toBe("success");
        expect(result.ips.length).toBeGreaterThan(0);
        expect(result.ips[0]).toMatch(/\d+\.\d+\.\d+\.\d+/);
    });

});