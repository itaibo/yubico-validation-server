import * as yup from 'yup';

export const validateSchema = async <T extends yup.Schema>(params: { schema: T, data: any }): Promise<yup.Asserts<T> | null> => {
  let parsedParams: yup.InferType<typeof params.schema>;

  try {
    parsedParams = await params.schema.validate(params.data);
    return parsedParams;
  } catch (error) {
    console.log(error)
    return null;
  }
};
