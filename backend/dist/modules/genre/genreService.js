"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGenre = exports.updateGenre = exports.createGenre = exports.getGenreById = exports.getAllGenres = void 0;
const GenreRepository = __importStar(require("./genreRepository"));
const getAllGenres = async (req, res) => {
    const genres = await GenreRepository.findAllGenres();
    res.json({ success: true, data: genres });
};
exports.getAllGenres = getAllGenres;
const getGenreById = async (req, res) => {
    const genre = await GenreRepository.findGenreById(req.params.id);
    if (!genre) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    res.json({ success: true, data: genre });
};
exports.getGenreById = getGenreById;
const createGenre = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ success: false, message: "Name is required" });
        return;
    }
    const existing = await GenreRepository.findGenreByName(name);
    if (existing) {
        res.status(409).json({ success: false, message: "Genre already exists" });
        return;
    }
    const genre = await GenreRepository.createGenre({ name });
    res.status(201).json({ success: true, data: genre });
};
exports.createGenre = createGenre;
const updateGenre = async (req, res) => {
    const existing = await GenreRepository.findGenreById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    const { name } = req.body;
    const genre = await GenreRepository.updateGenre(req.params.id, { name });
    res.json({ success: true, data: genre });
};
exports.updateGenre = updateGenre;
const deleteGenre = async (req, res) => {
    const existing = await GenreRepository.findGenreById(req.params.id);
    if (!existing) {
        res.status(404).json({ success: false, message: "Genre not found" });
        return;
    }
    await GenreRepository.deleteGenre(req.params.id);
    res.json({ success: true, message: "Genre deleted" });
};
exports.deleteGenre = deleteGenre;
//# sourceMappingURL=genreService.js.map