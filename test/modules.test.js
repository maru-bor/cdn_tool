import { expect } from 'chai';
import { dnsLookup } from '../modules/dnsLookup.js';
import { tlsDetect } from '../modules/tlsDetect.js';
import { httpDetect } from '../modules/httpDetect.js';
import { cacheAnalysis } from '../modules/cacheAnalysis.js';
import { cdnDetect } from '../modules/cdnDetect.js';
import { performanceTest} from '../modules/performanceTest.js';

describe("CDN Tool Testing", () => {

    it("dnsLookup returns valid IPs for valid site", async () => {
        const result = await dnsLookup("https://github.com");
        expect(result.status).to.equal("success");
        expect(Array.isArray(result.ips)).to.be.true;
        expect(result.ips.length).to.be.greaterThan(0);
        expect(result.ips[0]).to.match(/\d+\.\d+\.\d+\.\d+/);
    });

    it("dnsLookup returns error for invalid site", async () => {
        const result = await dnsLookup("https://example.invalid");
        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });

    it("tlsDetect returns certificate info for valid site", async () => {
        const result = await tlsDetect("https://github.com");

        expect(result.status).to.equal("success");
        expect(result).to.have.property("protocol");
        expect(result).to.have.property("validFrom");
        expect(result).to.have.property("validTo");
        expect(result).to.have.property("daysRemaining");
    });

    it("tlsDetect returns error for an invalid site", async () => {
        const result = await tlsDetect("https://example.invalid");

        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });

    it("cacheAnalysis returns caching headers for valid site", async () => {
        const result = await cacheAnalysis("https://github.com");

        expect(result.status).to.equal("success");
        expect(result).to.have.property("cacheControl");
        expect(result).to.have.property("expires");
        expect(result).to.have.property("cacheability");
    });

    it("cacheAnalysis returns error for invalid site", async () => {
        const result = await cacheAnalysis("https://example.invalid");

        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });

    it("cdnDetect returns success object for valid site", async () => {
        const result = await cdnDetect("https://github.com");

        expect(result.status).to.equal("success");
        expect(result).to.have.property("cdnProv");


    });

    it("cdnDetect returns error for invalid site", async () => {
        const result = await cdnDetect("https://example.invalid");

        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");

    });

    it("httpDetect returns protocol info for valid site", async () => {
        const result = await httpDetect("https://github.com");

        expect(result.status).to.equal("success");
        expect(result).to.have.property("protocol");

    });

    it("httpDetect returns error for invalid site", async () => {
        const result = await httpDetect("https://example.invalid");

        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");

    });

    it("performanceTest returns TTFB for valid site", async () => {
        const result = await performanceTest("https://github.com");

        expect(result.status).to.equal("success");
        expect(result).to.have.property("ttfb");
    });

    it("performanceTest returns error for invalid site", async () => {
        const result = await performanceTest("https://example.invalid");

        expect(result.status).to.equal("error");
        expect(result).to.have.property("code");
    });



});