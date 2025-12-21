# Contributing to Philanthropical

Thank you for your interest in contributing to Philanthropical! This document provides guidelines and instructions for contributing.

## Development Setup

See the main [README.md](../README.md) for setup instructions.

## Code Style

### Solidity
- Follow Solidity style guide
- Use `solhint` for linting
- Maximum line length: 120 characters
- Use meaningful variable names
- Comment complex logic

### TypeScript/JavaScript
- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting
- Maximum line length: 100 characters

### Git Commits
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(contracts): add batch donation function
fix(frontend): resolve wallet connection issue
docs: update deployment guide
```

## Development Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test your changes**
   ```bash
   # Contracts
   cd contracts && npm run test
   
   # Frontend
   cd frontend && npm run lint && npm run type-check
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Testing Requirements

### Smart Contracts
- All new functions must have tests
- Test coverage must remain >90%
- Include edge cases and error conditions
- Test gas optimization

### Frontend
- Test user flows
- Test error handling
- Test wallet interactions
- Test responsive design

## Pull Request Process

1. **Create PR** with clear description
2. **Ensure CI passes** (tests, linting, security scans)
3. **Request review** from maintainers
4. **Address feedback** and update PR
5. **Merge** after approval

### PR Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CI checks passing
- [ ] Security considerations addressed

## Security

- **Never commit** private keys or secrets
- **Report vulnerabilities** privately
- **Review** all external dependencies
- **Follow** security best practices

## Documentation

- Update README for user-facing changes
- Update architecture docs for structural changes
- Add code comments for complex logic
- Update API docs for endpoint changes

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive in discussions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Respect different viewpoints

Thank you for contributing to Philanthropical!

