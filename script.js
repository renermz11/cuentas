// Estado global de la aplicación
let appState = {
    step: 1,
    numPersonas: 0,
    personas: [],
    gastos: []
};

// Elementos del DOM
const elements = {
    header: null,
    formContainer: null,
    resultadosContainer: null,
    errorContainer: null,
    modal: null,
    modalText: null
};

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    showStep1();
});

// Inicializar referencias a elementos del DOM
function initializeElements() {
    elements.header = document.getElementById('main-header');
    elements.formContainer = document.getElementById('form-container');
    elements.resultadosContainer = document.getElementById('resultados-container');
    elements.errorContainer = document.getElementById('error-container');
    elements.modal = document.getElementById('whatsapp-modal');
    elements.modalText = document.getElementById('modal-text');
}

// Inicializar event listeners
function initializeEventListeners() {
    // Event listener para cerrar modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    
    // Cerrar modal al hacer click fuera de él
    elements.modal.addEventListener('click', function(e) {
        if (e.target === elements.modal) {
            closeModal();
        }
    });
    
    // Event listener para escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Función para mostrar errores
function showError(message) {
    elements.errorContainer.innerHTML = `
        <div class="ios-error fade-in">
            ${message}
        </div>
    `;
    elements.errorContainer.scrollIntoView({ behavior: 'smooth' });
}

// Función para limpiar errores
function clearError() {
    elements.errorContainer.innerHTML = '';
}

// Función para actualizar el header
function updateHeader(isResults = false, title = 'Calculadora de Gastos Compartidos', subtitle = 'Divide gastos de forma fácil y equitativa') {
    const headerClass = isResults ? 'ios-header resultado-header' : 'ios-header';
    elements.header.className = headerClass;
    elements.header.innerHTML = `
        <h1 class="ios-title-1 mb-2">${title}</h1>
        <p class="ios-body">${subtitle}</p>
    `;
}

// Paso 1: Número de personas
function showStep1() {
    appState.step = 1;
    clearError();
    updateHeader();
    
    elements.formContainer.innerHTML = `
        <div class="ios-card fade-in">
            <div class="ios-card-content">
                <h2 class="ios-title-2 mb-4 text-center">¿Cuántas personas participan?</h2>
                
                <div class="ios-form-group">
                    <label class="ios-label" for="num_personas">Número de personas</label>
                    <select id="num_personas" class="ios-input ios-select">
                        <option value="">Selecciona el número de personas</option>
                        ${Array.from({length: 8}, (_, i) => `<option value="${i + 2}">${i + 2} personas</option>`).join('')}
                    </select>
                    <p class="ios-helper-text">Mínimo 2 personas, máximo 9 personas</p>
                </div>
                
                <button type="button" class="ios-button ios-button-primary w-100" onclick="handleStep1()">
                    Continuar
                </button>
            </div>
        </div>
    `;
}

// Manejar el paso 1
function handleStep1() {
    const numPersonas = parseInt(document.getElementById('num_personas').value);
    
    if (!numPersonas || numPersonas < 2 || numPersonas > 9) {
        showError('Por favor selecciona un número válido de personas (entre 2 y 9)');
        return;
    }
    
    appState.numPersonas = numPersonas;
    appState.personas = Array.from({length: numPersonas}, () => ({ nombre: '' }));
    showStep2();
}

// Paso 2: Nombres de las personas
function showStep2() {
    appState.step = 2;
    clearError();
    
    elements.formContainer.innerHTML = `
        <div class="ios-card fade-in">
            <div class="ios-card-content">
                <h2 class="ios-title-2 mb-4 text-center">Ingresa los nombres</h2>
                
                ${appState.personas.map((_, i) => `
                    <div class="ios-form-group">
                        <label class="ios-label" for="nombre_${i}">Persona ${i + 1}</label>
                        <input type="text" 
                               id="nombre_${i}" 
                               class="ios-input" 
                               placeholder="Nombre de la persona ${i + 1}"
                               value="${appState.personas[i].nombre}"
                               maxlength="50">
                    </div>
                `).join('')}
                
                <div class="mt-4">
                    <button type="button" class="ios-button ios-button-secondary w-100 mb-3" onclick="showStep1()">
                        ← Volver
                    </button>
                    <button type="button" class="ios-button ios-button-primary w-100" onclick="handleStep2()">
                        Continuar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Manejar el paso 2
function handleStep2() {
    const nombres = [];
    let hasError = false;
    
    for (let i = 0; i < appState.numPersonas; i++) {
        const nombre = document.getElementById(`nombre_${i}`).value.trim();
        if (!nombre) {
            showError(`Por favor ingresa el nombre de la persona ${i + 1}`);
            hasError = true;
            break;
        }
        nombres.push(nombre);
    }
    
    if (hasError) return;
    
    // Verificar nombres duplicados
    const nombresUnicos = new Set(nombres.map(n => n.toLowerCase()));
    if (nombresUnicos.size !== nombres.length) {
        showError('No puede haber nombres duplicados');
        return;
    }
    
    // Guardar nombres
    appState.personas = nombres.map(nombre => ({ nombre }));
    showStep3();
}

// Paso 3: Gastos y detalles
function showStep3() {
    appState.step = 3;
    clearError();
    
    elements.formContainer.innerHTML = `
        <div class="ios-card fade-in">
            <div class="ios-card-content">
                <h2 class="ios-title-2 mb-4 text-center">Detalles de los gastos</h2>
                
                <div id="gastos-container">
                    ${createGastoForm(0)}
                </div>
                
                <button type="button" class="ios-button ios-button-secondary w-100 mb-3" onclick="addGasto()">
                    + Agregar otro gasto
                </button>
                
                <div class="ios-divider"></div>
                
                <div class="mt-4">
                    <button type="button" class="ios-button ios-button-secondary w-100 mb-3" onclick="showStep2()">
                        ← Volver
                    </button>
                    <button type="button" class="ios-button ios-button-primary w-100" onclick="handleStep3()">
                        Calcular
                    </button>
                </div>
            </div>
        </div>
    `;
    
    appState.gastos = [createEmptyGasto()];
}

// Crear un gasto vacío
function createEmptyGasto() {
    return {
        concepto: '',
        monto: '',
        pagadoPor: '',
        noPagaron: []
    };
}

// Crear formulario de gasto
function createGastoForm(index) {
    const gasto = appState.gastos[index] || createEmptyGasto();
    
    return `
        <div class="persona-card" id="gasto-${index}">
            <div class="ios-form-group">
                <label class="ios-label" for="concepto_${index}">Concepto del gasto</label>
                <input type="text" 
                       id="concepto_${index}" 
                       class="ios-input" 
                       placeholder="Ej: Cena, transporte, hotel..."
                       value="${gasto.concepto}"
                       maxlength="100">
            </div>
            
            <div class="ios-form-group">
                <label class="ios-label" for="monto_${index}">Monto total</label>
                <div class="ios-input-group">
                    <span class="ios-input-group-text">$</span>
                    <input type="number" 
                           id="monto_${index}" 
                           class="ios-input" 
                           placeholder="0.00"
                           value="${gasto.monto}"
                           min="0.01"
                           step="0.01">
                </div>
            </div>
            
            <div class="ios-form-group">
                <label class="ios-label" for="pagado_por_${index}">¿Quién pagó?</label>
                <select id="pagado_por_${index}" class="ios-input ios-select">
                    <option value="">Selecciona quién pagó</option>
                    ${appState.personas.map((persona, i) => `
                        <option value="${i}" ${gasto.pagadoPor == i ? 'selected' : ''}>
                            ${persona.nombre}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="ios-form-group">
                <label class="ios-label">¿Quién NO participó en este gasto?</label>
                <p class="ios-helper-text mb-3">Marca las personas que NO deben pagar este gasto</p>
                
                ${appState.personas.map((persona, i) => `
                    <label class="ios-checkbox">
                        <input type="checkbox" 
                               id="no_pago_${index}_${i}"
                               ${gasto.noPagaron.includes(i) ? 'checked' : ''}>
                        <span class="ios-checkbox-label">${persona.nombre}</span>
                    </label>
                `).join('')}
            </div>
            
            ${appState.gastos.length > 1 ? `
                <button type="button" class="ios-button ios-button-secondary w-100 mt-3" onclick="removeGasto(${index})">
                    Eliminar este gasto
                </button>
            ` : ''}
        </div>
    `;
}

// Agregar nuevo gasto
function addGasto() {
    if (appState.gastos.length >= 10) {
        showError('Máximo 10 gastos permitidos');
        return;
    }
    
    appState.gastos.push(createEmptyGasto());
    const container = document.getElementById('gastos-container');
    container.innerHTML += createGastoForm(appState.gastos.length - 1);
}

// Eliminar gasto
function removeGasto(index) {
    if (appState.gastos.length <= 1) {
        showError('Debe haber al menos un gasto');
        return;
    }
    
    appState.gastos.splice(index, 1);
    refreshGastosContainer();
}

// Refrescar el container de gastos
function refreshGastosContainer() {
    const container = document.getElementById('gastos-container');
    container.innerHTML = appState.gastos.map((_, index) => createGastoForm(index)).join('');
}

// Manejar el paso 3
function handleStep3() {
    clearError();
    
    // Recopilar datos de gastos
    const gastosData = [];
    let hasError = false;
    
    for (let i = 0; i < appState.gastos.length; i++) {
        const concepto = document.getElementById(`concepto_${i}`).value.trim();
        const monto = parseFloat(document.getElementById(`monto_${i}`).value);
        const pagadoPor = parseInt(document.getElementById(`pagado_por_${i}`).value);
        
        // Validaciones
        if (!concepto) {
            showError(`Por favor ingresa el concepto del gasto ${i + 1}`);
            hasError = true;
            break;
        }
        
        if (!monto || monto <= 0) {
            showError(`Por favor ingresa un monto válido para el gasto ${i + 1}`);
            hasError = true;
            break;
        }
        
        if (isNaN(pagadoPor)) {
            showError(`Por favor selecciona quién pagó el gasto ${i + 1}`);
            hasError = true;
            break;
        }
        
        // Recopilar quiénes no pagaron
        const noPagaron = [];
        for (let j = 0; j < appState.numPersonas; j++) {
            const checkbox = document.getElementById(`no_pago_${i}_${j}`);
            if (checkbox && checkbox.checked) {
                noPagaron.push(j);
            }
        }
        
        // Verificar que al menos una persona participe
        if (noPagaron.length >= appState.numPersonas) {
            showError(`Al menos una persona debe participar en el gasto ${i + 1}`);
            hasError = true;
            break;
        }
        
        gastosData.push({
            concepto,
            monto,
            pagadoPor,
            noPagaron
        });
    }
    
    if (hasError) return;
    
    // Guardar gastos y calcular
    appState.gastos = gastosData;
    calcularYMostrarResultados();
}

// Calcular balances y transferencias
function calcularYMostrarResultados() {
    const { balances, transferencias, totalGastado, promedioPersona } = calcularBalances();
    
    updateHeader(true, 'Resultados del Cálculo', 'Aquí están los balances y transferencias necesarias');
    
    elements.formContainer.style.display = 'none';
    elements.resultadosContainer.style.display = 'block';
    elements.resultadosContainer.className = 'fade-in';
    
    elements.resultadosContainer.innerHTML = `
        <div class="ios-success">
            Cálculo completado exitosamente
        </div>
        
        <div class="resumen-general">
            <div class="resultado-card">
                <p class="ios-headline">$${totalGastado.toFixed(2)}</p>
                <p class="ios-footnote">Total gastado</p>
            </div>
            <div class="resultado-card">
                <p class="ios-headline">$${promedioPersona.toFixed(2)}</p>
                <p class="ios-footnote">Por persona</p>
            </div>
        </div>
        
        ${transferencias.length > 0 ? `
            <div class="transfers-section">
                <h3 class="transfers-title">
                    💸 Transferencias necesarias
                </h3>
                ${transferencias.map(transferencia => `
                    <div class="movimiento-card">
                        <strong>${appState.personas[transferencia.deudor].nombre}</strong> debe transferir 
                        <strong>$${transferencia.monto.toFixed(2)}</strong> a 
                        <strong>${appState.personas[transferencia.acreedor].nombre}</strong>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="ios-success">
                ¡Perfecto! Todas las cuentas están equilibradas.
            </div>
        `}
        
        <div class="details-section">
            <div class="details-toggle" onclick="toggleDetails()">
                <span class="details-toggle-text">Ver detalles del balance</span>
                <span class="details-toggle-icon">▼</span>
            </div>
            <div class="details-content" id="details-content">
                ${balances.map((balance, index) => `
                    <div class="balance-card-expanded">
                        <div class="balance-card-header">
                            <h4 class="balance-card-title">${appState.personas[index].nombre}</h4>
                        </div>
                        <div class="balance-details">
                            <div class="balance-item">
                                <span class="balance-label">Total pagado:</span>
                                <span class="balance-value">$${balance.totalPagado.toFixed(2)}</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Debe pagar:</span>
                                <span class="balance-value">$${balance.debePagar.toFixed(2)}</span>
                            </div>
                            <div class="balance-item">
                                <span class="balance-label">Balance final:</span>
                                <span class="balance-value ${balance.balance > 0 ? 'text-success' : balance.balance < 0 ? 'text-error' : ''}">
                                    $${balance.balance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        
                        ${balance.gastosDetalle.length > 0 ? `
                            <div class="mt-3">
                                <p class="ios-footnote mb-2">Gastos en los que participó:</p>
                                ${balance.gastosDetalle.map(gasto => `
                                    <span class="concept-tag">${gasto.concepto}: $${gasto.montoPersonal.toFixed(2)}</span>
                                `).join(' ')}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="mt-4">
            <button type="button" class="ios-button ios-button-primary w-100 mb-3" onclick="shareWhatsApp()">
                📱 Compartir por WhatsApp
            </button>
            <button type="button" class="ios-button ios-button-secondary w-100" onclick="nuevaCalculacion()">
                🔄 Nueva Calculación
            </button>
        </div>
    `;
}

// Función para calcular balances
function calcularBalances() {
    // Inicializar balances
    const balances = appState.personas.map((persona, index) => ({
        totalPagado: 0,
        debePagar: 0,
        balance: 0,
        gastosDetalle: []
    }));
    
    let totalGastado = 0;
    
    // Procesar cada gasto
    appState.gastos.forEach(gasto => {
        totalGastado += gasto.monto;
        
        // Quien pagó
        balances[gasto.pagadoPor].totalPagado += gasto.monto;
        
        // Calcular participantes (los que NO están en noPagaron)
        const participantes = [];
        for (let i = 0; i < appState.numPersonas; i++) {
            if (!gasto.noPagaron.includes(i)) {
                participantes.push(i);
            }
        }
        
        // Dividir el gasto entre participantes
        const montoPorPersona = gasto.monto / participantes.length;
        
        participantes.forEach(participante => {
            balances[participante].debePagar += montoPorPersona;
            balances[participante].gastosDetalle.push({
                concepto: gasto.concepto,
                montoPersonal: montoPorPersona
            });
        });
    });
    
    // Calcular balances finales
    balances.forEach(balance => {
        balance.balance = balance.totalPagado - balance.debePagar;
    });
    
    const promedioPersona = totalGastado / appState.numPersonas;
    
    // Calcular transferencias necesarias
    const transferencias = calcularTransferencias(balances);
    
    return { balances, transferencias, totalGastado, promedioPersona };
}

// Calcular transferencias necesarias
function calcularTransferencias(balances) {
    const acreedores = [];
    const deudores = [];
    
    // Separar acreedores y deudores
    balances.forEach((balance, index) => {
        if (balance.balance > 0.01) { // Acreedor (le deben)
            acreedores.push({ index, monto: balance.balance });
        } else if (balance.balance < -0.01) { // Deudor (debe)
            deudores.push({ index, monto: Math.abs(balance.balance) });
        }
    });
    
    const transferencias = [];
    
    // Algoritmo para minimizar transferencias
    let i = 0, j = 0;
    while (i < acreedores.length && j < deudores.length) {
        const acreedor = acreedores[i];
        const deudor = deudores[j];
        
        const montoTransferencia = Math.min(acreedor.monto, deudor.monto);
        
        if (montoTransferencia > 0.01) {
            transferencias.push({
                deudor: deudor.index,
                acreedor: acreedor.index,
                monto: montoTransferencia
            });
        }
        
        acreedor.monto -= montoTransferencia;
        deudor.monto -= montoTransferencia;
        
        if (acreedor.monto < 0.01) i++;
        if (deudor.monto < 0.01) j++;
    }
    
    return transferencias;
}

// Toggle detalles
function toggleDetails() {
    const toggle = document.querySelector('.details-toggle');
    const content = document.getElementById('details-content');
    
    toggle.classList.toggle('expanded');
    content.classList.toggle('show');
}

// Nueva calculación
function nuevaCalculacion() {
    appState = {
        step: 1,
        numPersonas: 0,
        personas: [],
        gastos: []
    };
    
    elements.formContainer.style.display = 'block';
    elements.resultadosContainer.style.display = 'none';
    clearError();
    showStep1();
}

// Compartir por WhatsApp
function shareWhatsApp() {
    const { balances, transferencias, totalGastado, promedioPersona } = calcularBalances();
    
    let mensaje = `🧾 *RESUMEN DE GASTOS COMPARTIDOS*\n\n`;
    mensaje += `💰 *Total gastado:* $${totalGastado.toFixed(2)}\n`;
    mensaje += `👥 *Por persona:* $${promedioPersona.toFixed(2)}\n\n`;
    
    if (transferencias.length > 0) {
        mensaje += `💸 *TRANSFERENCIAS NECESARIAS:*\n`;
        transferencias.forEach(t => {
            mensaje += `• ${appState.personas[t.deudor].nombre} → ${appState.personas[t.acreedor].nombre}: $${t.monto.toFixed(2)}\n`;
        });
        mensaje += `\n`;
    } else {
        mensaje += `✅ *¡Todas las cuentas están equilibradas!*\n\n`;
    }
    
    mensaje += `📊 *DETALLE POR PERSONA:*\n`;
    balances.forEach((balance, index) => {
        const status = balance.balance > 0.01 ? '💚' : balance.balance < -0.01 ? '❤️' : '⚖️';
        mensaje += `${status} ${appState.personas[index].nombre}: `;
        mensaje += `Pagó $${balance.totalPagado.toFixed(2)} | `;
        mensaje += `Debe $${balance.debePagar.toFixed(2)} | `;
        mensaje += `Balance $${balance.balance.toFixed(2)}\n`;
    });
    
    mensaje += `\n📱 _Calculado con la Calculadora de Gastos Compartidos_`;
    
    // Mostrar modal
    elements.modalText.value = mensaje;
    elements.modal.style.display = 'block';
}

// Abrir WhatsApp
function openWhatsApp() {
    const mensaje = elements.modalText.value;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://wa.me/?text=${mensajeCodificado}`;
    window.open(url, '_blank');
}

// Copiar texto
function copyText() {
    elements.modalText.select();
    elements.modalText.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        
        // Feedback visual
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '¡Copiado!';
        button.style.background = 'var(--success)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar el texto. Por favor, selecciona y copia manualmente.');
    }
}

// Cerrar modal
function closeModal() {
    elements.modal.style.display = 'none';
}

// Funciones globales para que puedan ser llamadas desde el HTML
window.handleStep1 = handleStep1;
window.handleStep2 = handleStep2;
window.handleStep3 = handleStep3;
window.showStep1 = showStep1;
window.showStep2 = showStep2;
window.addGasto = addGasto;
window.removeGasto = removeGasto;
window.toggleDetails = toggleDetails;
window.nuevaCalculacion = nuevaCalculacion;
window.shareWhatsApp = shareWhatsApp;
window.openWhatsApp = openWhatsApp;
window.copyText = copyText;
window.closeModal = closeModal;
