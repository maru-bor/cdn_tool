import { expect } from 'chai';
import { dnsLookup } from '../modules/dnsLookup.js';

describe("CDN Tool Testing", () => {

    it("dnsLookup returns valid IPs for a correct domain name", async () => {
        const result = await dnsLookup("github.com");
        expect(result.status).to.equal("success");
        expect(Array.isArray(result.ips)).to.be.true;
        expect(result.ips.length).to.be.greaterThan(0);
        expect(result.ips[0]).to.match(/\d+\.\d+\.\d+\.\d+/);
    });

    it("dnsLookup throws an error code for an incorrect domain name", async () => {
        const result = await dnsLookup("example.invalid");
        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });




});