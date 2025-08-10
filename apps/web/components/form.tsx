"use client";

import { useActionState, useEffect, useState } from "react";

const initialValues = {
  name: "John",
  age: 10,
  isUser: false,
};

export default function Form({ action }: { action: any }) {
  const handleForm = async (previousState: any, formData: FormData) => {
    console.log(previousState, Object.fromEntries(formData));
    const a = await action(formData);
    console.log(a);
    return previousState;
  };
  const [formState, formDispatch] = useActionState(handleForm, initialValues);
  const [state, setState] = useState(initialValues);
  useEffect(() => setState(formState), [formState]);
  console.log(formState);
  return (
    <form action={formDispatch}>
      <input
        type="text"
        name="name"
        value={state.name}
        onChange={(e) => setState({ ...state, name: e.target.value })}
      />
      <input
        type="number"
        name="age"
        value={state.age}
        onChange={(e) => setState({ ...state, age: Number(e.target.value) })}
      />
      <input
        type="checkbox"
        name="isUser"
        checked={state.isUser}
        onChange={(e) => setState({ ...state, isUser: e.target.checked })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
