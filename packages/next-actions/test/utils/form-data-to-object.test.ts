import { describe, it, expect } from "vitest";
import { formDataToObject } from "../../src/utils";

describe("Example Test Suite", () => {
  it("should pass", () => {
    expect(formDataToObject(new FormData())).toStrictEqual({});
  });

  it("complex objects", () => {
    const formData = new FormData();
    formData.append("name", JSON.stringify("John Doe"));
    formData.append("age", JSON.stringify(30));
    formData.append("city", JSON.stringify("New York"));
    //Add nested objects
    formData.append("address.city", JSON.stringify("New York"));
    formData.append("address.zip", JSON.stringify("10001"));
    //Add array
    formData.append("hobbies[]", JSON.stringify("reading"));
    formData.append("hobbies[]", JSON.stringify("traveling"));

    const data = formDataToObject(formData);
    expect(data).toStrictEqual({
      name: "John Doe",
      age: 30,
      city: "New York",
      address: {
        city: "New York",
        zip: "10001",
      },
      hobbies: ["reading", "traveling"],
    });
  });
});
