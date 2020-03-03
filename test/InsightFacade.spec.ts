import {expect} from "chai";
import * as fs from "fs-extra";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import InsightFacade from "../src/controller/InsightFacade";
import "./Server.spec";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        abcabc: "./test/data/abcabc.zip",
        emptyfolder: "./test/data/emptyfolder.zip",
        wrongfiletype: "./test/data/wrongfiletype.JSON",
        novalidcourse: "./test/data/novalidcourse.zip",
        hello_world: "./test/data/hello_world.zip",
        CPSCtest1: "./test/data/CPSCtest1.zip",
        onegoodonebad: "./test/data/onegoodonebad.zip",
        rooms: "./test/data/rooms.zip",
        nocoursesfolder: "./test/data/nocoursesfolder.zip",
        indexWrongPlace: "./test/data/indexWrongPlace.zip",
        noRoomFolder: "./test/data/noRoomFolder.zip",
        movedRoomFile: "./test/data/movedRoomFile.zip",
        bldgFileNoTable: "./test/data/bldgFileNoTable.zip",
        bldgFileNoFurniture: "./test/data/bldgFileNoFurniture.zip",
        bldgFileNoNumber: "./test/data/bldgFileNoNumber.zip",
        indexNoTable: "./test/data/indexNoTable.zip",
        noIndexFile: "./test/data/noIndexFile.zip",
        room: "./test/data/room.zip",
        oneBldgNoAdrs: "./test/data/oneBldgNoAdrs.zip",
        indexTwoTables: "./test/data/indexTwoTables.zip",
        oneBldgNoLName: "./test/data/oneBldgNoLName.zip",
        oneBldgNoFurnitureOneValid: "./test/data/oneBldgNoFurnitureOneValid.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
    });

    beforeEach(function () {
        this.timeout(0);
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs before each test, which should make each test independent from the previous one
        Log.test(`BeforeTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
        // try {
        //     fs.removeSync(cacheDir);
        //     fs.mkdirSync(cacheDir);
        //     insightFacade = new InsightFacade();
        // } catch (err) {
        //     Log.error(err);
        // }
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });


    // it("Should add a valid room dataset", function () {
    //     this.timeout(0);
    //     const id: string = "rooms";
    //     const expected: string[] = [id];
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
    //         expect(result).to.deep.equal(expected);
    //     }).catch((err: any) => {
    //         expect.fail(err, expected, "Should not have rejected");
    //     });
    // });

    // it("Add valid room dataset one building has no long name", function () {
    //     const id: string = "oneBldgNoLName";
    //     const expected: string[] = [id];
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
    //         expect(result).to.deep.equal(expected);
    //     }).catch((err: any) => {
    //         expect.fail(err, expected, "Should not have rejected");
    //     });
    // });

    it("Should add a valid room dataset one bldg no address one valid building", function () {
        const id: string = "oneBldgNoAdrs";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });

    // it("Should add a valid room dataset index file has two tables", function () {
    //     const id: string = "indexTwoTables";
    //     const expected: string[] = [id];
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
    //         expect(result).to.deep.equal(expected);
    //     }).catch((err: any) => {
    //         expect.fail(err, expected, "Should not have rejected");
    //     });
    // });

    it("Index not in rooms directory expect InsightError", function () {
        const id: string = "indexWrongPlace";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("Index does not contain table expect InsightError", function () {
        const id: string = "indexNoTable";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("No room folder expect InsightError", function () {
        const id: string = "noRoomFolder";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("Test listDataset with room dataset", function () {
        const id: string = "oneBldgNoAdrs";
        let expected: InsightDataset[] = [
            {id: "oneBldgNoAdrs", kind: InsightDatasetKind.Rooms, numRows: 61},
        ];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((temp: string[]) => {
            return insightFacade.listDatasets().then((result: InsightDataset[]) => {
                expect(result).to.deep.equal(expected);
            }).catch((err: any) => {
                expect.fail();
            });
        });
    });

    it("Test listDataset with persisted room file", function () {
        fs.copyFileSync("./test/data/oneBldgNoAdrs_rooms_61", "./data/rooms_rooms_61");
        let query1 = JSON.parse(fs.readFileSync("./test/query_persistence/validBasicRooms.json", "utf8"));
        Log.info(query1.query);
        return insightFacade.performQuery(query1.query).then((result: any) => {
            expect(result).to.have.lengthOf(61);
        }).catch((err: any) => {
            expect.fail();
        });
    });

    it("Test listDataset with persisted course file", function () {
        fs.copyFileSync("./test/data/CPSCtest1_courses_263", "./data/courses_courses_263");
        let query1 = JSON.parse(fs.readFileSync("./test/query_persistence/validBasicCourses.json", "utf8"));
        return insightFacade.performQuery(query1.query).then((result) => {
            Log.info(result.length);
            expect(result).to.have.lengthOf(263);
        }).catch((err: any) => {
            expect.fail();
        });
    });

    // it("Test listDataset moved one room file resulting in less rooms", function () {
    //     const id: string = "movedRoomFile";
    //     let expected: InsightDataset[] = [
    //         {id: "movedRoomFile", kind: InsightDatasetKind.Rooms, numRows: 359},
    //     ];
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((temp: string[]) => {
    //         return insightFacade.listDatasets().then((result: InsightDataset[]) => {
    //             expect(result).to.deep.equal(expected);
    //         }).catch((err: any) => {
    //             expect.fail();
    //         });
    //     });
    // });

    it("Add room dataset building file no room table", function () {
        const id: string = "bldgFileNoTable";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("Add room dataset building file no furniture field", function () {
        const id: string = "bldgFileNoFurniture";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("Add room dataset building file one bldg no furniture field one valid bldg", function () {
        const id: string = "oneBldgNoFurnitureOneValid";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail();
        });
    });

    it("Add room dataset building file no number field", function () {
        const id: string = "bldgFileNoNumber";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("Add room dataset missing index file", function () {
        const id: string = "noIndexFile";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });

    it("Add room dataset wrong directory name", function () {
        const id: string = "room";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
// });

    // This is a unit test. You should create more like this!
    // it("Should add a valid dataset", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
    //         expect(result).to.deep.equal(expected);
    //     }).catch((err: any) => {
    //         expect.fail(err, expected, "Should not have rejected");
    //     });
    // });

    it("Adding a small valid dataset", function () {
        const id: string = "CPSCtest1";
        const expected: string[] = [id];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail(err, expected, "Should not have rejected");
        });
    });
    it("Adding a dataset with no courses folder", function () {
        const id: string = "nocoursesfolder";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail("should not have added with invalid dir name");
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("Add same dataset twice and expect InsightError", function () {
        const id: string = "CPSCtest1";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result: string[]) => {
                expect.fail();
            }).catch((err: any) => {
                expect(err).to.be.instanceOf(InsightError);
            });
        });
    });
    it("Add two different dataset", function () {
        const id: string = "CPSCtest1";
        const id2: string = "onegoodonebad";
        const expected: string[] = [id, id2];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.addDataset(id2, datasets[id2],
            InsightDatasetKind.Courses).then((result: string[]) => {
                expect(result).to.deep.equal(expected);
            }).catch((err: any) => {
                expect.fail();
            });
        });
    });
    it("Test listDataset with one added dataset", function () {
        const id: string = "CPSCtest1";
        let expected: InsightDataset[] = [
            {id: "CPSCtest1", kind: InsightDatasetKind.Courses, numRows: 263},
        ];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.listDatasets().then((result: InsightDataset[]) => {
                expect(result).to.deep.equal(expected);
            }).catch((err: any) => {
                expect.fail();
            });
        });
    });
    it("Test listDataset with one added dataset that has bad file", function () {
        const id: string = "onegoodonebad";
        let expected: InsightDataset[] = [
            {id: "onegoodonebad", kind: InsightDatasetKind.Courses, numRows: 43},
        ];
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.listDatasets().then((result: InsightDataset[]) => {
                expect(result).to.deep.equal(expected);
            }).catch((err: any) => {
                expect.fail();
            });
        });
    });
    it("Test empty dataset list", function () {
        let expected: InsightDataset[] = [];
        return insightFacade.listDatasets().then((result: InsightDataset[]) => {
            expect(result).to.deep.equal(expected);
        }).catch((err: any) => {
            expect.fail();
        });
    });
    it("Add then remove dataset", function () {
        const id: string = "CPSCtest1";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.removeDataset(id).then((result: string) => {
                expect(result).to.deep.equal(id);
            }).catch((err: any) => {
                expect.fail("Should not have rejected");
            });
        });
    });
    it("Add two datasets then remove one dataset", function () {
        const id: string = "abcabc";
        const id2: string = "CPSCtest1";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.addDataset(id2, datasets[id2],
            InsightDatasetKind.Courses).then((result: string[]) => {
                return insightFacade.removeDataset(id2).then((myResult: string) => {
                    expect(myResult).to.deep.equal(id2);
                }).catch((err: any) => {
                    expect.fail("Should not have rejected");
                });
            });
        });
    });
    it("Remove dataset from empty dataset list", function () {
        const id: string = "courses";
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(NotFoundError);
        });
    });
    it("Add a dataset then remove a dataset not added", function () {
        const id: string = "CPSCtest1";
        const id2: string = "abcabc";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((temp: string[]) => {
            return insightFacade.removeDataset(id2).then((result: string) => {
                expect.fail();
            }).catch((err: any) => {
                expect(err).to.be.instanceOf(NotFoundError);
            });
        });
    });
    it("add dataaset zip with no file inside", function () {
        const id: string = "emptyfolder";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("add dataset with no valid course", function () {
        const id: string = "novalidcourse";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("add dataset with wrong file type", function () {
        const id: string = "wrongfiletype";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("add white space id", function () {
        const id: string = " ";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("add underscore id", function () {
        const id: string = "hello_world";
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("add null id", function () {
        const id: string = null;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("add undefined id", function () {
        const id: string = undefined;
        return insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).then((result: string[]) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("remove white space id", function () {
        const id: string = " ";
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("remove null id", function () {
        const id: string = null;
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("remove undefined id", function () {
        const id: string = undefined;
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
    it("remove underscore id", function () {
        const id: string = "hello_world";
        return insightFacade.removeDataset(id).then((result: string) => {
            expect.fail();
        }).catch((err: any) => {
            expect(err).to.be.instanceOf(InsightError);
        });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: any } = {
        rooms: {id: "rooms", path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms},
        courses: {id: "courses", path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
    };
    let insightFacade: InsightFacade = new InsightFacade();
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        this.timeout(0);
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        for (const key of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[key];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(ds.id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * For D1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });
    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function (done) {
                    insightFacade.performQuery(test.query).then((result) => {
                        TestUtil.checkQueryResult(test, result, done);
                    }).catch((err) => {
                        TestUtil.checkQueryResult(test, err, done);
                    });
                });
            }
        });
    });
});
