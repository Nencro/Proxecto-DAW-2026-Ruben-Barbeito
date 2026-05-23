package com.proxecto.daw.travelback.exception;

public class LoginException extends RuntimeException {

    private final int codigo;

    public LoginException(int codigo, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
    }

    public int getCodigo() {
        return codigo;
    }
}
