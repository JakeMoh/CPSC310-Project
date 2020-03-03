import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind} from "../src/controller/IInsightFacade";
import TestUtil from "./TestUtil";
import {ITestQuery} from "./InsightFacade.spec";

describe("Facade D3", function () {
    const cacheDir = __dirname + "/../data";

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        server.start().then(function (val: boolean) {
            Log.info("App::initServer() - started: " + val);
        }).catch(function (err: Error) {
            Log.error("App::initServer() - ERROR: " + err.message);
        });
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
        server.stop();
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
        } catch (err) {
            Log.error(err);
        }
        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
        // might want to add some process logging here to keep track of what"s going on
    });

    it("GET test for echo message", function () {
        this.timeout(0);
        try {
            return chai.request("http://localhost:4321")
                .get("/echo/hello")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect.fail();
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("GET test for static fail", function () {
        this.timeout(0);
        try {
            return chai.request("http://localhost:4321")
                .get("/hello")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect.fail();
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect(err.status).to.be.equal(500);
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        abcabc: "./test/data/abcabc.zip",
        rooms: "./test/data/rooms.zip",
    };
    const queriesToLoad: { [id: string]: string } = {
        valid: "./test/server_query/complex.json",
        invalid: "./test/server_query/invalid.json",
    };
    let datasets: { [id: string]: any } = {};
    let queries: { [id: string]: any } = {};
    for (const id of Object.keys(datasetsToLoad)) {
        datasets[id] = fs.readFileSync(datasetsToLoad[id]);
    }
    for (const id of Object.keys(queriesToLoad)) {
        queries[id] = JSON.parse(fs.readFileSync(queriesToLoad[id], "utf8"));
    }

    // it("PUT test for courses dataset", function () {
    //     this.timeout(0);
    //     const id: string = "courses";
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/courses/courses")
    //             .send(datasets[id])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 Log.trace("Server response received: " + res.status);
    //                 expect(res.status).to.be.equal(200);
    //                 expect(res.body.result).to.deep.equal(["courses"]);
    //             })
    //             .catch(function (err) {
    //                 Log.info("server response error");
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         Log.info("server failure");
    //         // and some more logging here!
    //     }
    // });
    //
    // it("PUT test for rooms dataset", function () {
    //     this.timeout(0);
    //     const id: string = "rooms";
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/rooms/rooms")
    //             .send(datasets[id])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 Log.trace("Server response received: " + res.status);
    //                 let body = res.body;
    //                 expect(res.status).to.be.equal(200);
    //                 expect(res.body.result).to.deep.equal(["rooms"]);
    //             })
    //             .catch(function (err) {
    //                 Log.info("server response error");
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         Log.info("server failure");
    //         // and some more logging here!
    //     }
    // });

    it("PUT test for rooms and courses dataset", function () {
        this.timeout(0);
        const id: string = "rooms";
        const id2: string = "courses";
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal(["rooms"]);
                    return chai.request("http://localhost:4321")
                        .put("/dataset/courses/courses")
                        .send(datasets[id2])
                        .set("Content-Type", "application/x-zip-compressed")
                        .then(function (result: Response) {
                            let body = result.body;
                            expect(result.status).to.be.equal(200);
                            expect(result.body.result).to.deep.equal(["rooms", "courses"]);
                        }).catch(function (err) {
                            Log.info("server response error");
                            expect.fail();
                        });
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect.fail();
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("PUT test for dataset wrong kind", function () {
        this.timeout(0);
        const id: string = "courses";
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/rooms")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect.fail();
                })
                .catch(function (err) {
                    Log.info("server response error status");
                    Log.trace("Server response received: " + err.status);
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("PUT test for dataset error id", function () {
        this.timeout(5000);
        const id: string = "courses";
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses_courses/courses")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect.fail("should not have received success response code");
                })
                .catch(function (err) {
                    Log.info("server response error status");
                    Log.trace("Server response received: " + err.status);
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    // it("PUT test for dataset adding same dataset twice", function () {
    //     this.timeout(0);
    //     const id: string = "rooms";
    //     try {
    //         return chai.request("http://localhost:4321")
    //             .put("/dataset/rooms/rooms")
    //             .send(datasets[id])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 Log.trace("Server response received: " + res.status);
    //                 expect(res.status).to.be.equal(200);
    //                 return chai.request("http://localhost:4321")
    //                     .put("/dataset/rooms/rooms")
    //                     .send(datasets[id])
    //                     .set("Content-Type", "application/x-zip-compressed")
    //                     .then(function (result: Response) {
    //                         Log.trace("Server response received: " + res.status);
    //                         expect.fail("should not have received success response code");
    //                     }).catch(function (err) {
    //                         Log.info("server response error status");
    //                         Log.trace("Server response received: " + err.status);
    //                         expect(err.status).to.be.equal(400);
    //                     });
    //             })
    //             .catch(function (err) {
    //                 Log.info("server response error status");
    //                 Log.trace("Server response received: " + err.status);
    //                 expect(err.status).to.be.equal(400);
    //             });
    //     } catch (err) {
    //         Log.info("server failure");
    //         // and some more logging here!
    //     }
    // });

    it("DEL test for dataset not found error", function () {
        this.timeout(5000);
        const id: string = "courses";
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect.fail("should not have received success response code");
                })
                .catch(function (err) {
                    Log.info("server response error status");
                    Log.trace("Server response received: " + err.status);
                    expect(err.status).to.be.equal(404);
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("DEL test for dataset id error", function () {
        this.timeout(5000);
        const id: string = "courses";
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses_")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect.fail("should not have received success response code");
                })
                .catch(function (err) {
                    Log.info("server response error status");
                    Log.trace("Server response received: " + err.status);
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("DEL test for rooms dataset - add then remove", function () {
        this.timeout(0);
        const id: string = "rooms";
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal(["rooms"]);
                    return chai.request("http://localhost:4321")
                        .del("/dataset/rooms")
                        .then(function (result: Response) {
                            let body = result.body;
                            expect(result.status).to.be.equal(200);
                            expect(result.body.result).to.deep.equal("rooms");
                        }).catch(function (err) {
                            Log.info("server response error");
                            expect.fail();
                        });
                })
                .catch(function (err) {
                    Log.info("server response error");
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("GET test for listDataset courses", function () {
        this.timeout(0);
        const id: string = "rooms";
        let expected: InsightDataset[] = [
            {id: "rooms", kind: InsightDatasetKind.Rooms, numRows: 364},
        ];
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal(["rooms"]);
                    return chai.request("http://localhost:4321")
                        .get("/datasets")
                        .then(function (result: Response) {
                            Log.trace("Server response received: " + res.status);
                            let body = result.body;
                            expect(result.status).to.be.equal(200);
                            expect(result.body.result).to.deep.equal(expected);
                        }).catch(function (err) {
                            Log.info("server response error");
                            expect.fail();
                        });
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect.fail();
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("GET test for empty dataset", function () {
        this.timeout(0);
        try {
            return chai.request("http://localhost:4321")
                .get("/datasets")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result).to.deep.equal([]);
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect.fail();
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("POST test for invalid query course dataset", function () {
        this.timeout(0);
        const id: string = "courses";
        const invalid: string = "invalid";
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                    return chai.request("http://localhost:4321")
                        .post("/query")
                        .send(queries[invalid].query)
                        .set("Content-type", "application/json")
                        .then(function (result: Response) {
                            Log.trace("Server response received: " + res.status);
                            expect.fail();
                        }).catch(function (err) {
                            Log.info("server response error");
                            Log.trace("POST query server response: " + err.status);
                            expect(err.status).to.be.equal(400);
                        });
                })
                .catch(function (err) {
                    Log.info("server response error from PUT");
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("POST test for valid query course dataset", function () {
        this.timeout(0);
        const id: string = "courses";
        const valid: string = "valid";
        let query = queries[valid].query;
        Log.info(query);
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server: add dataset success");
                    Log.trace("Server response received: " + res.status);
                    expect(res.status).to.be.equal(200);
                    return chai.request("http://localhost:4321")
                        .post("/query")
                        .send(query)
                        // .set("Content-type", "application/json")
                        .then(function (result: Response) {
                            Log.trace("Server response received: " + res.status);
                            let body = result.body;
                            expect(result.status).to.be.equal(200);
                            // expect(result.body.result).to.deep.equal(queries[valid].result);
                        }).catch(function (err) {
                            Log.info("Server: invalid query");
                            expect.fail();
                        });
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect.fail();
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });

    it("POST test for query with service shut down", function () {
        this.timeout(0);
        const id: string = "courses";
        const valid: string = "valid";
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(datasets[id])
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("Server: Dataset add success.");
                    Log.trace("Server response received: " + res.status);
                    return server.stop().then((b) => server.start()).then(function (val: boolean) {
                        Log.info("App::initServer() - restarted: " + val);
                        return chai.request("http://localhost:4321")
                            .post("/query")
                            .send(queries[valid].query)
                            .set("Content-type", "application/json")
                            .then(function (result: Response) {
                                Log.trace("Server response received: " + res.status);
                                let body = result.body;
                                expect(result.status).to.be.equal(200);
                                // expect(result.body.result).to.deep.equal(queries[valid].result);
                            }).catch(function (err) {
                                Log.info("server response error");
                                expect.fail();
                            });
                    }).catch(function (err: Error) {
                        Log.error("App::initServer() - ERROR: " + err.message);
                        expect.fail();
                    });
                })
                .catch(function (err) {
                    Log.info("server response error");
                    expect.fail();
                });
        } catch (err) {
            Log.info("server failure");
            // and some more logging here!
        }
    });


    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});

