import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const CompanyRegister: React.FC = () => {
    const navigate = useNavigate();

    // State for inputs
    const [ruc, setRuc] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [cedula, setCedula] = useState('');
    const [nombres, setNombres] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for verification/flow
    const [isRucVerified, setIsRucVerified] = useState(false);
    const [isIdVerified, setIsIdVerified] = useState(false);
    const [loadingRuc, setLoadingRuc] = useState(false);
    const [loadingId, setLoadingId] = useState(false);
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyRuc = async () => {
        if (ruc.length !== 13) {
            setError('El RUC debe tener 13 dígitos');
            return;
        }
        setLoadingRuc(true);
        setError('');
        try {
            const proxyUrl = 'https://infoplacas.herokuapp.com/';
            const targetUrl = `https://aggregator.cipherbyte.ec/company/${ruc}`;

            const response = await fetch(proxyUrl + targetUrl);
            if (!response.ok) throw new Error('RUC no encontrado o error en el servidor');
            const data = await response.json();

            if (data && data.razonSocial) {
                setCompanyName(data.razonSocial);
                setIsRucVerified(true);
            } else {
                throw new Error('No se pudo obtener la razón social de la empresa');
            }
        } catch (err: any) {
            setError(err.message || 'Error al verificar RUC');
        } finally {
            setLoadingRuc(false);
        }
    };

    const handleIdBlur = async () => {
        if (cedula.length === 10 && !isNaN(Number(cedula))) {
            setLoadingId(true);
            setError('');
            try {
                const proxyUrl = 'https://infoplacas.herokuapp.com/';
                const targetUrl = 'https://si.secap.gob.ec/sisecap/logeo_web/json/busca_persona_registro_civil.php';

                const postData = {
                    documento: cedula,
                    tipo: '1'
                };

                const response = await fetch(proxyUrl + targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(postData)
                });

                if (!response.ok) throw new Error(`Error: ${response.status}`);
                const data = await response.json();

                if (data && data.nombres && data.apellidos) {
                    setNombres(data.nombres);
                    setApellidos(data.apellidos);
                    setFechaNacimiento(data.fechaNacimiento || '');
                    setIsIdVerified(true);
                } else {
                    setError('No se encontraron datos para esta cédula');
                }
            } catch (err: any) {
                setError('Error al validar la cédula: ' + err.message);
            } finally {
                setLoadingId(false);
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoadingRegister(true);
        setError('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                ruc_empresa: ruc,
                nombre_cooperativa: companyName,
                cedula: cedula,
                chofer: `${nombres} ${apellidos}`,
                fecha_nacimiento: fechaNacimiento,
                correo: email,
                telefono: telefono,
                rol: 'BUS',
                createdAt: new Date().toISOString()
            });

            navigate('/unit-registration');
        } catch (err: any) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoadingRegister(false);
        }
    };

    const isFormComplete =
        isRucVerified &&
        isIdVerified &&
        email &&
        telefono &&
        password &&
        confirmPassword &&
        password === confirmPassword;

    return (
        <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-4 md:p-8 font-body">
            {/* Main Registration Container */}
            <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-xl shadow-2xl bg-surface-container-lowest">
                {/* Branding & Context Column */}
                <section className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Bus moderno en Ecuador"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxQPML4jDbVY5pRk_xr8MearntmqgkQBa0I-TP5JfCYj_kcW6gE8GPpnbpBhM7QRjmkm6jt9don4DhfuVSZw4-GcNc1xh_uEDlnaG71ZfI9Vm6Ylb4fHa72Phsd7nSIeSwP1odrbvsZdS0wJEcHam2Pa04KDXXlO0KMY396DldsrSjhtTKpxPa2otIDAUJ5sIZI-pK0_AdKe8ftQRQvU2UIJ_L9Tp8OwnkD-2rSBoN5iThHJWPIhX9DlCJAO_3SJLpphy7YaFVkHLN"
                        />
                        <div className="absolute inset-0 bg-[#001453]/80 mix-blend-multiply"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3755c3]/60 to-[#607cec]/60"></div>
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <span className="material-symbols-outlined text-4xl text-[#607cec]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                            <h1 className="text-2xl font-black tracking-tighter text-white font-headline">Meridian Transit</h1>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight mb-6 font-headline">
                            Optimiza la logística de tu cooperativa con precisión.
                        </h2>
                        <p className="text-lg text-blue-100/80 leading-relaxed font-light">
                            Únete a la red de transporte más avanzada del país. Gestión de flotas, despacho automatizado y control de personal en tiempo real.
                        </p>
                    </div>
                    <div className="relative z-10 bg-white/80 backdrop-blur-md p-6 rounded-lg border border-white/10">
                        <div className="flex items-start gap-4">
                            <span className="material-symbols-outlined text-[#001453]">verified</span>
                            <div>
                                <p className="text-xs uppercase tracking-widest font-bold text-[#001453] mb-1">Verificación Oficial</p>
                                <p className="text-sm text-on-surface-variant leading-snug">
                                    Nuestra plataforma está conectada directamente con los sistemas del <span className="font-semibold">SRI</span> y <span className="font-semibold">Registro Civil</span> para garantizar la validez de los datos.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Form Column */}
                <section className="lg:col-span-7 p-8 md:p-12 lg:p-16 overflow-y-auto max-h-[921px] lg:max-h-none">
                    <header className="mb-10">
                        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">Crear Cuenta de Operaciones</h2>
                        <p className="text-on-surface-variant font-body">Complete el formulario para registrar su cooperativa y administrador.</p>
                    </header>

                    {error && (
                        <div className="p-4 mb-6 bg-error-container border border-error/20 rounded-xl text-on-error-container text-sm font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-error">error</span>
                            {error}
                        </div>
                    )}

                    <form className="space-y-10" onSubmit={handleRegister}>
                        {/* Section 1: Cooperativa */}
                        <fieldset className="space-y-6">
                            <legend className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-2 mb-4">
                                <span className="w-8 h-[1px] bg-outline-variant"></span>
                                Registro de Cooperativa
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="ruc">RUC DE LA EMPRESA</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-surface-tint focus:ring-0 text-sm py-3 px-4 transition-all"
                                            id="ruc"
                                            placeholder="179XXXXXXX001"
                                            type="text"
                                            value={ruc}
                                            onChange={(e) => {
                                                setRuc(e.target.value);
                                                setIsRucVerified(false);
                                                setCompanyName('');
                                                setIsIdVerified(false);
                                                setCedula('');
                                                setNombres('');
                                                setApellidos('');
                                                setFechaNacimiento('');
                                            }}
                                        />
                                        {!isRucVerified && (
                                            <button
                                                className="bg-surface-container-highest hover:bg-surface-container-high text-primary font-bold px-4 py-3 rounded text-xs transition-all active:scale-95 flex items-center gap-2"
                                                type="button"
                                                onClick={handleVerifyRuc}
                                                disabled={loadingRuc}
                                            >
                                                {loadingRuc ? '...' : 'VERIFICAR'}
                                            </button>
                                        )}
                                        {isRucVerified && <span className="material-symbols-outlined text-success">check_circle</span>}
                                    </div>
                                    <p className="mt-2 text-[10px] text-outline italic">Consulta automática via SRI</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="nombre_cooperativa">NOMBRE DE LA COOPERATIVA</label>
                                    <textarea
                                        className="w-full bg-surface-container-highest/50 border-none text-on-surface-variant text-sm py-3 px-4 cursor-not-allowed italic resize-none min-h-[60px]"
                                        id="nombre_cooperativa"
                                        placeholder="Nombre se cargará al verificar RUC"
                                        readOnly
                                        value={companyName}
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 2: Administrador */}
                        <fieldset className={`space-y-6 transition-opacity duration-300 ${isRucVerified ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                            <legend className="text-xs font-bold uppercase tracking-widest text-outline flex items-center gap-2 mb-4">
                                <span className="w-8 h-[1px] bg-outline-variant"></span>
                                Datos del Administrador
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="cedula">CÉDULA DE IDENTIDAD</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-surface-tint focus:ring-0 text-sm py-3 px-4"
                                            id="cedula"
                                            placeholder="17XXXXXXXX"
                                            type="text"
                                            maxLength={10}
                                            value={cedula}
                                            onChange={(e) => {
                                                setCedula(e.target.value);
                                                setIsIdVerified(false);
                                                setNombres('');
                                                setApellidos('');
                                                setFechaNacimiento('');
                                            }}
                                            onBlur={handleIdBlur}
                                            disabled={!isRucVerified}
                                        />
                                        {loadingId ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent mx-2"></div>
                                        ) : (
                                            !isIdVerified ? (
                                                <button
                                                    type="button"
                                                    onClick={handleIdBlur}
                                                    className="bg-surface-container-highest hover:bg-surface-container-high text-primary font-bold px-4 py-3 rounded text-xs transition-all active:scale-95"
                                                >
                                                    VERIFICAR
                                                </button>
                                            ) : (
                                                <span className="material-symbols-outlined text-success px-2">check_circle</span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 transition-all duration-300 ${isIdVerified ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="nombres">NOMBRES</label>
                                        <input className="w-full bg-surface-container-highest/50 border-none text-sm py-3 px-4 cursor-not-allowed italic text-on-surface-variant" id="nombres" value={nombres} readOnly type="text" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="apellidos">APELLIDOS</label>
                                        <input className="w-full bg-surface-container-highest/50 border-none text-sm py-3 px-4 cursor-not-allowed italic text-on-surface-variant" id="apellidos" value={apellidos} readOnly type="text" />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="fecha_nacimiento">FECHA DE NACIMIENTO</label>
                                        <input className="w-full bg-surface-container-highest/50 border-none text-sm py-3 px-4 cursor-not-allowed italic text-on-surface-variant" id="fecha_nacimiento" value={fechaNacimiento} readOnly type="text" />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="email">CORREO ELECTRÓNICO</label>
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-surface-tint focus:ring-0 text-sm py-3 px-4"
                                            id="email"
                                            placeholder="admin@cooperativa.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="telefono">TELÉFONO DE CONTACTO</label>
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-surface-tint focus:ring-0 text-sm py-3 px-4"
                                            id="telefono"
                                            placeholder="09XXXXXXXX"
                                            type="tel"
                                            value={telefono}
                                            onChange={(e) => setTelefono(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="password">CONTRASEÑA</label>
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-surface-tint focus:ring-0 text-sm py-3 px-4"
                                            id="password"
                                            placeholder="••••••••"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="confirm_password">CONFIRMAR CONTRASEÑA</label>
                                        <input
                                            className="w-full bg-surface-container-low border-none border-b-2 border-transparent focus:border-surface-tint focus:ring-0 text-sm py-3 px-4"
                                            id="confirm_password"
                                            placeholder="••••••••"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Actions */}
                        <div className="pt-6 space-y-6">
                            <button
                                className={`w-full bg-gradient-to-r from-[#3755c3] to-[#607cec] text-white font-bold py-4 rounded shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${!isFormComplete || loadingRegister ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl hover:opacity-90'}`}
                                type="submit"
                                disabled={!isFormComplete || loadingRegister}
                            >
                                {loadingRegister ? 'REGISTRANDO...' : 'REGISTRARSE'}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-container-high">
                                <Link className="text-sm font-semibold text-[#3755c3] hover:underline flex items-center gap-2" to="/">
                                    ¿Ya tienes una cuenta? <span className="font-bold">Iniciar Sesión</span>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-outline font-medium tracking-tight uppercase">Protegido por Transit Secure</span>
                                    <span className="material-symbols-outlined text-outline text-sm">lock</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
            </main>

            {/* Contextual Instructional Text Overlay */}
            <div className="fixed bottom-6 right-6 hidden md:block z-50">
                <div className="bg-white border border-outline-variant/30 p-4 rounded-xl shadow-xl max-w-xs flex gap-3 items-start">
                    <span className="material-symbols-outlined text-[#3755c3]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        <span className="font-bold block mb-1">Nota Técnica</span>
                        Al verificar el RUC, el sistema consultará el estado tributario en la base de datos oficial y validará la identidad del administrador con los registros del Registro Civil de Ecuador.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompanyRegister;
