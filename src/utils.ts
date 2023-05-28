import { TimeoutError } from "./libs/errors";

export function convertStrTolist(
  stringToConvert: string | undefined,
  delimiter?: string
): string[] {
  if (stringToConvert) {
    const list: string[] = stringToConvert.trim().split(delimiter ?? ",");

    list.forEach((element, i) => {
      list[i] = element.trim();
    });

    return list;
  }

  return [];
}

export function filterFields(
  fields: object,
  permittedFields: string[]
): Record<string, any> {
  const filteredFields: Record<string, any> = {};

  Object.keys(fields).forEach((field) => {
    if (permittedFields.includes(field)) {
      filteredFields[field] = (fields as any)[field];
    }
  });

  return filteredFields;
}

export async function timeout(time: number, command: any): Promise<any> {
  try {
    const result = await Promise.race([
      command,
      new Promise<void>((_, reject) => {
        setTimeout(
          () =>
            reject(new TimeoutError("Operation expired, because it has taken too long to respond")),
          time
        );
      }),
    ]);

    return result;
  } catch (error) {
    throw error;
  }
}
