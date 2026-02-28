"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.del = this.del.bind(this);
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.query) {
                    const filterData = yield this.model.find(req.query);
                    return res.json(filterData);
                }
                else {
                    const data = yield this.model.find();
                    res.json(data);
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving data");
            }
        });
    }
    ;
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const data = yield this.model.findById(id);
                if (!data) {
                    return res.status(404).send("Data not found");
                }
                else {
                    res.json(data);
                }
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving data by ID");
            }
        });
    }
    ;
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = req.body;
            console.log(postData);
            try {
                // Validate that message is not empty
                if (!postData.message || postData.message.trim() === "") {
                    return res.status(400).send("Message is required");
                }
                // If there's an id in route params and model has postId field, use it
                if (req.params.id) {
                    const schema = this.model.schema;
                    const hasPostId = schema.paths.postId !== undefined;
                    if (hasPostId && !postData.postId) {
                        postData.postId = req.params.id;
                    }
                }
                const data = yield this.model.create(postData);
                res.status(201).json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error creating data");
            }
        });
    }
    ;
    del(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const deletedData = yield this.model.findByIdAndDelete(id);
                res.status(200).json(deletedData);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error deleting data");
            }
        });
    }
    ;
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const updatedData = req.body;
            try {
                if (!updatedData.message || updatedData.message.trim() === "") {
                    return res.status(400).send("Message is required");
                }
                const data = yield this.model.findByIdAndUpdate(id, updatedData, {
                    new: true,
                });
                res.json(data);
            }
            catch (err) {
                console.error(err);
                res.status(500).send("Error updating data");
            }
        });
    }
    ;
}
;
exports.default = BaseController;
//# sourceMappingURL=baseContorller.js.map