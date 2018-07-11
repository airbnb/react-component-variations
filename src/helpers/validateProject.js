import { validate } from 'jsonschema';
import projectSchema from '../projectConfig';

export default function validateProject(projectConfig) {
  const { errors } = validate(projectConfig, projectSchema);
  if (errors.length > 0) {
    throw new SyntaxError(`invalid project config:\n   - ${errors.join('\n   - ')}`);
  }
}
