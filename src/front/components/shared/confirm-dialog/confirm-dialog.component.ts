import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <section class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmDialogTitle">
      <h2 id="confirmDialogTitle">{{ data.title }}</h2>
      <p>{{ data.message }}</p>

      <div class="confirm-dialog-actions">
        <button class="app-button app-button--secondary" type="button" (click)="close(false)">
          {{ data.cancelText || 'No' }}
        </button>
        <button class="app-button app-button--danger" type="button" (click)="close(true)">
          {{ data.confirmText || 'Si' }}
        </button>
      </div>
    </section>
  `,
  styles: [`
    .confirm-dialog {
      width: min(calc(100vw - 32px), 420px);
      padding: 22px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-popover);
    }

    .confirm-dialog h2 {
      margin: 0 0 10px;
      color: var(--color-text);
      font-size: 22px;
    }

    .confirm-dialog p {
      margin: 0;
      color: var(--color-text-subtle);
      line-height: 1.5;
    }

    .confirm-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }

    @media (max-width: 520px) {
      .confirm-dialog-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(DIALOG_DATA) public readonly data: ConfirmDialogData,
    private readonly dialogRef: DialogRef<boolean>
  ) {
  }

  close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}
