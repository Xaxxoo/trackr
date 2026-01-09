import { PartialType, OmitType } from '@nestjs/swagger';
import { AddBomItemDto } from './add-bom-item.dto';

export class UpdateBomItemDto extends PartialType(
  OmitType(AddBomItemDto, ['itemType', 'itemId'] as const),
) {}