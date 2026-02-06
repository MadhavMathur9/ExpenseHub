package MadhavMathur.ExpenseHub.service;

import MadhavMathur.ExpenseHub.dto.CategoryDTO;
import MadhavMathur.ExpenseHub.entity.CategoryEntity;
import MadhavMathur.ExpenseHub.entity.ProfileEntity;
import MadhavMathur.ExpenseHub.repository.CategoryRepository;
import MadhavMathur.ExpenseHub.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProfileRepository profileRepository;

    public List<CategoryDTO> getCategoriesByProfile(Long profileId) {
        profileRepository.findById(profileId).ifPresent(this::createDefaultCategories);
        return categoryRepository.findByProfileId(profileId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO createCategory(CategoryDTO dto, ProfileEntity profile) {
        CategoryEntity entity = toEntity(dto);
        entity.setProfile(profile);
        entity = categoryRepository.save(entity);
        return toDTO(entity);
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO dto, Long profileId) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        
        if (!category.getProfile().getId().equals(profileId)) {
            throw new SecurityException("Unauthorized action on category");
        }

        category.setName(dto.getName());
        category.setType(dto.getType());
        category.setIcon(dto.getIcon());
        category = categoryRepository.save(category);
        return toDTO(category);
    }

    public void deleteCategory(Long id, Long profileId) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (!category.getProfile().getId().equals(profileId)) {
            throw new SecurityException("Unauthorized action on category");
        }

        categoryRepository.delete(category);
    }

    public void createDefaultCategories(ProfileEntity profile) {
        // Default categories list
        createDefault(profile, "Salary", "INCOME", "💰");
        createDefault(profile, "Freelance", "INCOME", "💻");
        createDefault(profile, "Investment", "INCOME", "📈");
        createDefault(profile, "Food", "EXPENSE", "🍔");
        createDefault(profile, "Rent/Utilities", "EXPENSE", "🏠");
        createDefault(profile, "Entertainment", "EXPENSE", "🍿");
        createDefault(profile, "Travel", "EXPENSE", "✈️");
        createDefault(profile, "Health", "EXPENSE", "🏥");
        createDefault(profile, "Others", "EXPENSE", "🏷️");
    }

    private void createDefault(ProfileEntity profile, String name, String type, String icon) {
        if (categoryRepository.findByNameAndProfileId(name, profile.getId()).isEmpty()) {
            CategoryEntity category = CategoryEntity.builder()
                    .name(name)
                    .type(type)
                    .icon(icon)
                    .profile(profile)
                    .build();
            categoryRepository.save(category);
        }
    }

    public CategoryEntity toEntity(CategoryDTO dto) {
        return CategoryEntity.builder()
                .id(dto.getId())
                .name(dto.getName())
                .type(dto.getType())
                .icon(dto.getIcon())
                .build();
    }

    public CategoryDTO toDTO(CategoryEntity entity) {
        return CategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .icon(entity.getIcon())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
