package com.proxecto.daw.travelback.exception;

public class RegisterConflictException extends RuntimeException {

    private final int codigo;

    public RegisterConflictException(int codigo, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }
}
