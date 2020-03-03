/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */

CampusExplorer.buildQuery = function () {
    // console.log("<< Starting buildQuery >> ");
    // console.log("===================================")

    /**
     * Extract
     */

        // determines whether you are working on courses or rooms
    const tabDataset = document.getElementsByClassName('tab-panel active')[0];

    // get dataset as a string
    const dataSet = tabDataset.getAttribute('data-type');
    // console.log("dataSet: ")
    // console.log(dataSet);

    // WHERE

    let conditions = [];

    const listOfCondition = tabDataset.getElementsByClassName('control-group condition');
    for (const condition of listOfCondition) {
        // // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        // // console.log("---for loop---");
        // // console.log("");
        const fields = condition.getElementsByClassName('control fields')[0].getElementsByTagName('option');
        // retrieve key
        let conditionKey;
        for (const field of fields) {
            if (field.selected) {
                conditionKey = dataSet + "_" + field.value;
            }
        }

        const operators = condition.getElementsByTagName('option');
        let operator;
        for (const operator_ of operators) {
            if (operator_.selected) {
                operator = operator_.value;
            }
        }

        // retrieve value
        let value = condition.getElementsByClassName('control term')[0]
            .getElementsByTagName('input')[0].value;
        // convert to type to number if value is a number && not empty && operator is not IS
        if (!isNaN(value) && value.length >= 1 && operator != "IS") {
            value = Number(value);
        }

        let controlGroupCondition = {};
        let subControlGroupCondition = {};
        subControlGroupCondition[conditionKey] = value;
        controlGroupCondition[operator] = subControlGroupCondition;

        if (condition.getElementsByTagName('input')[0].checked) {
            controlGroupCondition = {NOT: controlGroupCondition};
        }

        // // console.log("controlGroupCondition");
        // // console.log(JSON.stringify(controlGroupCondition, null, 4));
        // // console.log("");

        conditions.push(controlGroupCondition);
        // // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }

    // OPTIONS

    //      COLUMNS

    let fields = [];

    // regular keys
    const controlFields = tabDataset.getElementsByClassName('form-group columns')[0]
        .getElementsByClassName('control field');
    for (let controlField of controlFields) {
        controlField = controlField.getElementsByTagName('input')[0];
        if (controlField.checked) {
            fields.push(dataSet + "_" + controlField.value);
        }
    }

    // apply keys
    const controlTransformations = tabDataset.getElementsByClassName('form-group columns')[0]
        .getElementsByClassName('control transformation');
    for (let controlTransformation of controlTransformations) {
        controlTransformation = controlTransformation.getElementsByTagName('input')[0];
        if (controlTransformation.checked) {
            fields.push(controlTransformation.value);
        }
    }

    //      ORDER

    const order = tabDataset.getElementsByClassName('form-group order')[0];
    const orderFields_ = order.getElementsByTagName('option');
    let orderFields = [];
    for (const orderField of orderFields_) {
        if (orderField.selected) {
            let orderKey;
            // console.log("orderField.class");
            // console.log(orderField.hasAttribute("class"));
            if (orderField.hasAttribute("class")) {
                // console.log("1");
                orderKey = orderField.value;
                // console.log(orderKey);
            } else {
                // console.log("2");
                orderKey = dataSet + "_" + orderField.value;
                // console.log(orderKey);
            }
            orderFields.push(orderKey);
        }
    }
    // // console.log("orderFields");
    // // console.log(orderFields);
    // // console.log("");

    let orderDirection = "UP";
    const isDescending = order.getElementsByTagName('input')[0].checked;
    // console.log("isDescending");
    // console.log(isDescending);
    if (isDescending) {
        orderDirection = "DOWN";
    }
    // // console.log("orderDirection");
    // // console.log(orderDirection);
    // // console.log("");

    // TRANSFORMATIONS

    //      GROUP

    const group = tabDataset.getElementsByClassName('form-group groups')[0];
    const groupFields_ = group.getElementsByTagName('input');
    let groupFields = [];
    for (const groupField of groupFields_) {
        if (groupField.checked) {
            groupFields.push(dataSet + "_" + groupField.value);
        }
    }

    //      APPLY

    const applyHead = tabDataset.getElementsByClassName('form-group transformations')[0];
    const applyList = applyHead.getElementsByClassName('control-group transformation');
    let applyValue = [];
    for (const apply of applyList) {
        // get selected operator
        const operators = apply.getElementsByClassName('control operators')[0]
            .getElementsByTagName('option');
        let operator;
        for (const operator_ of operators) {
            if (operator_.selected) {
                operator = operator_.value;
            }
        }
        // get selected field
        const fields = apply.getElementsByClassName('control fields')[0]
            .getElementsByTagName('option');
        let field;
        for (const field_ of fields) {
            if (field_.selected) {
                field = field_.value;
            }
        }
        // create object
        let operatorAndKey = {};
        operatorAndKey[operator] = dataSet + "_" + field;

        // // console.log("operatorAndKey");
        // // console.log(operatorAndKey);
        // // console.log("");
        // apply key
        const applyKey = apply.getElementsByTagName('input')[0].value;
        let applyObj = {};
        applyObj[applyKey] = operatorAndKey;

        // // console.log("applyObj");
        // // console.log(JSON.stringify(applyObj, null, 4));
        // // console.log("");

        applyValue.push(applyObj);
    }


    /**
     * Build
     */

    let query = {WHERE: {}, OPTIONS: {COLUMNS: []}};

    // WHERE

    // if has conditions
    if (conditions.length != 0) {
        if (conditions.length == 1) {
            // console.log("condition");
            // console.log(Object.keys(conditions[0])[0]);
            if (document.getElementById('courses-conditiontype-none').checked) {
                query.WHERE = {NOT: conditions[0]}
            } else {
                query.WHERE = conditions[0];
            }
        } else {
            if (document.getElementById('courses-conditiontype-all').checked) {
                query.WHERE = {AND: conditions};
            } else if (document.getElementById('courses-conditiontype-any').checked) {
                query.WHERE = {OR: conditions};
            } else {
                query.WHERE = {NOT: {OR: conditions}};
            }
        }
    }

    // OPTIONS

    query.OPTIONS.COLUMNS = fields;

    // ORDER

    let orderValue;
    // check if there is any order selected
    if (orderFields.length >= 1 || isDescending) {
        // check if multi orders selected
        if (orderFields.length > 1 || isDescending) {
            orderValue = {dir: "", keys: []};
            orderValue.dir = orderDirection;
            orderValue.keys = orderFields;
        } else {
            orderValue = orderFields[0];
        }
        query.OPTIONS["ORDER"] = orderValue;
    }

    // TRANSFORMATIONS

    // check if group or apply has any input
    if (groupFields.length > 0 || applyValue.length > 0) {
        query["TRANSFORMATIONS"] = {GROUP: [], APPLY: []};
        if (groupFields.length > 0) {
            query.TRANSFORMATIONS.GROUP = groupFields;
        }
        if (applyValue.length > 0) {
            query.TRANSFORMATIONS.APPLY = applyValue;
        }
    }

    // console.log("6");

    // console.log("===================================")
    // console.log("Result query:");
    // console.log(JSON.stringify(query, null, 4));
    // console.log("<< Ending buildQuery >> ");
    return query;
};
