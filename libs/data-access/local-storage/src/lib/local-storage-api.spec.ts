import "@testing-library/jest-dom";
import { LocalStorageKeys } from "./local-storage-schema";
import {
	loadFromLocalStorage,
	removeFromLocalStorage,
	saveToLocalStorage
} from "./local-storage-api";
import SuperJSON from "superjson";
import { object } from "zod";

describe("localStorageApi", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("should return a parsed date object which is stored in localStorage", () => {
		const mockValue = new Date();
		const mockKey = "test_key" as LocalStorageKeys;
		localStorage.setItem(mockKey, SuperJSON.stringify(mockValue));

		const date = loadFromLocalStorage(mockKey);
		expect(date).toBeInstanceOf(Date);
		expect(date).toEqual(mockValue);
	});

	it("should remove a key from localStorage", () => {
		const mockKey = "test_key" as LocalStorageKeys;
		localStorage.setItem(mockKey, SuperJSON.stringify(new Date().toISOString()));

		removeFromLocalStorage(mockKey);
		expect(localStorage.getItem(mockKey)).toBeNull();
	});

	it("should save a date object to localStorage", () => {
		const mockValue = new Date();
		const mockKey = "test_key" as LocalStorageKeys;

		saveToLocalStorage(mockKey, mockValue);
		const date = loadFromLocalStorage(mockKey);
		expect(date).toEqual(mockValue);
	});

	it("should save a number to localStorage ", () => {
		const mockValue = 10;
		const mockKey = "test_key" as LocalStorageKeys;

		saveToLocalStorage(mockKey, mockValue);
		const value = loadFromLocalStorage(mockKey);
		expect(value).toEqual(mockValue);
	});

	it("should save a number to localStorage ", () => {
		const mockValue = { test: "value" };
		const mockKey = "test_key" as LocalStorageKeys;

		saveToLocalStorage(mockKey, mockValue);
		const value = loadFromLocalStorage(mockKey);
		expect(value).toEqual(mockValue);
	});
});
