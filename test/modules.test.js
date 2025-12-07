import { expect } from 'chai';
import { dnsLookup } from '../modules/dnsLookup.js';
import { tlsDetect } from '../modules/tlsDetect.js';

describe("CDN Tool Testing", () => {

    it("dnsLookup returns valid IPs for a correct domain name", async () => {
        const result = await dnsLookup("https://github.com");
        expect(result.status).to.equal("success");
        expect(Array.isArray(result.ips)).to.be.true;
        expect(result.ips.length).to.be.greaterThan(0);
        expect(result.ips[0]).to.match(/\d+\.\d+\.\d+\.\d+/);
    });

    it("dnsLookup throws an error code for an invalid domain name", async () => {
        const result = await dnsLookup("example.invalid");
        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });

    it("tlsDetect returns certificate info for valid domain", async () => {
        const result = await tlsDetect("https://github.com");

        expect(result.status).to.equal("success");
        expect(result).to.have.property("protocol");
        expect(result).to.have.property("validFrom");
        expect(result).to.have.property("validTo");
        expect(result).to.have.property("daysRemaining");
    });

    it("tlsDetect returns error for an invalid domain name", async () => {
        const result = await tlsDetect("example.invalid");

        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });



});