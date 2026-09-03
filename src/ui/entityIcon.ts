export function entityIconHtml(iconId: string, extraClass?: string): string {
  var cls = 'entity-icon' + (extraClass ? ' ' + extraClass : '');
  return (
    '<span class="' + cls + '" style="background-image: var(--img-entity-' +
    iconId + ')" aria-hidden="true"></span>'
  );
}
