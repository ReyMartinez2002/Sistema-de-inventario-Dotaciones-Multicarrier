import { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface RolOption {
  label: string;
  value: number;
}

interface FormValues {
  username: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  id_rol: number | null;
}

const RegistrarUsuario = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const roles: RolOption[] = [
    { label: 'Super Administrador', value: 1 },
    { label: 'Administrador', value: 2 },
    { label: 'Visualizador', value: 3 },
  ];

  const formik = useFormik<FormValues>({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
      nombre: '',
      id_rol: null,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .email('Debe ser un email válido')
        .required('Requerido'),
      password: Yup.string()
        .min(8, 'Mínimo 8 caracteres')
        .required('Requerido'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('Requerido'),
      nombre: Yup.string().required('Requerido'),
      id_rol: Yup.number().required('Requerido'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Aquí iría tu lógica para llamar a la API
        // await api.post('/usuarios', values);
        setSubmitted(true);
        setError('');
        resetForm();
      } catch (err) {
        console.error(err);
        setError('Error al registrar el usuario. Por favor intente nuevamente.');
      }
    },
  });

  return (
    <div className="p-grid p-fluid">
      <div className="p-col-12 p-lg-8 p-lg-offset-2">
        <Card title="Registrar Nuevo Usuario">
          {submitted ? (
            <Message severity="success" text="Usuario registrado exitosamente" />
          ) : error ? (
            <Message severity="error" text={error} />
          ) : null}

          <form onSubmit={formik.handleSubmit}>
            {/* Nombre */}
            <div className="p-field p-grid p-mt-3">
              <label htmlFor="nombre" className="p-col-12 p-md-3">
                Nombre Completo*
              </label>
              <div className="p-col-12 p-md-9">
                <InputText
                  id="nombre"
                  name="nombre"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.errors.nombre && formik.touched.nombre ? 'p-invalid' : ''}
                />
                {formik.touched.nombre && formik.errors.nombre && (
                  <small className="p-error">{formik.errors.nombre}</small>
                )}
              </div>
            </div>

            {/* Username */}
            <div className="p-field p-grid">
              <label htmlFor="username" className="p-col-12 p-md-3">
                Email (Usuario)*
              </label>
              <div className="p-col-12 p-md-9">
                <InputText
                  id="username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.errors.username && formik.touched.username ? 'p-invalid' : ''}
                />
                {formik.touched.username && formik.errors.username && (
                  <small className="p-error">{formik.errors.username}</small>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="p-field p-grid">
              <label htmlFor="password" className="p-col-12 p-md-3">
                Contraseña*
              </label>
              <div className="p-col-12 p-md-9">
                <Password
                  id="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  toggleMask
                  feedback={false}
                  className={formik.errors.password && formik.touched.password ? 'p-invalid' : ''}
                />
                {formik.touched.password && formik.errors.password && (
                  <small className="p-error">{formik.errors.password}</small>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="p-field p-grid">
              <label htmlFor="confirmPassword" className="p-col-12 p-md-3">
                Confirmar Contraseña*
              </label>
              <div className="p-col-12 p-md-9">
                <Password
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  toggleMask
                  feedback={false}
                  className={formik.errors.confirmPassword && formik.touched.confirmPassword ? 'p-invalid' : ''}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <small className="p-error">{formik.errors.confirmPassword}</small>
                )}
              </div>
            </div>

            {/* Rol */}
            <div className="p-field p-grid">
              <label htmlFor="id_rol" className="p-col-12 p-md-3">
                Rol*
              </label>
              <div className="p-col-12 p-md-9">
                <Dropdown
                  id="id_rol"
                  name="id_rol"
                  value={formik.values.id_rol}
                  options={roles}
                  onChange={(e) => formik.setFieldValue('id_rol', e.value)}
                  onBlur={formik.handleBlur}
                  placeholder="Seleccione un rol"
                  className={formik.errors.id_rol && formik.touched.id_rol ? 'p-invalid' : ''}
                />
                {formik.touched.id_rol && formik.errors.id_rol && (
                  <small className="p-error">{formik.errors.id_rol}</small>
                )}
              </div>
            </div>

            {/* Botón */}
            <div className="p-grid p-mt-4">
              <div className="p-col-12 p-md-3"></div>
              <div className="p-col-12 p-md-9">
                <Button
                  type="submit"
                  label="Registrar Usuario"
                  icon="pi pi-user-plus"
                  className="p-button-success"
                  disabled={!formik.isValid || formik.isSubmitting}
                />
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegistrarUsuario;
